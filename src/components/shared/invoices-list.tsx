"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm";
import { CreateInvoiceDialog } from "@/components/dashboard/create-invoice-dialog";
import { useAppData } from "@/contexts/data-context";
import { useT, useLang } from "@/i18n";
import { fmtMoney } from "@/lib/format";
import { copyToClipboard } from "@/lib/clipboard";
import { encodeSharedInvoice, type SharedInvoicePayload } from "@/domain/invoice-share";
import type { Invoice, InvoiceStatus } from "@/types/database";

const STATUS_LABEL_KEYS: Record<InvoiceStatus, string> = {
  draft: "invoice.statusDraft",
  sent: "invoice.statusSent",
  paid: "invoice.statusPaid",
  overdue: "invoice.statusOverdue",
};

const STATUS_CLASS: Record<InvoiceStatus, string> = {
  draft: "border-line text-muted-foreground",
  sent: "border-brand/30 bg-brand-soft text-brand",
  paid: "border-money/30 bg-brand-faint text-money",
  overdue: "border-destructive/30 bg-destructive/10 text-destructive",
};

/** Invoices page body: status, client, due date, share / mark sent / mark paid
 *  / delete, plus the "New invoice" entry point into CreateInvoiceDialog. */
export function InvoicesList() {
  const { invoices, loading, getClientById, getInvoiceItems, updateInvoice, deleteInvoice } = useAppData();
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const t = useT();
  const { lang } = useLang();
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const share = async (inv: Invoice) => {
    setBusy(inv.id);
    try {
      const items = await getInvoiceItems(inv.id);
      const payload: SharedInvoicePayload = {
        version: 1,
        invoiceNumber: inv.invoice_number,
        status: inv.status,
        currency: inv.currency,
        clientName: getClientById(inv.client_id)?.name ?? "",
        issuedAt: inv.created_at,
        dueDate: inv.due_date,
        notes: inv.notes,
        items: items.map((i) => ({ description: i.description, quantity: i.quantity, rate: i.rate, amount: i.amount })),
        subtotal: inv.subtotal,
        taxRate: inv.tax_rate,
        taxAmount: inv.tax_amount,
        total: inv.total,
      };
      const url = `${window.location.origin}/share/invoice?data=${encodeSharedInvoice(payload)}`;
      await copyToClipboard(url);
      toast(t("invoice.shareCopied"), "success");
    } catch (e) {
      console.error("[invoice] share failed:", e);
      toast(t("invoice.updateFailed"), "error");
    } finally {
      setBusy(null);
    }
  };

  const setStatus = async (inv: Invoice, status: "sent" | "paid") => {
    setBusy(inv.id);
    try {
      await updateInvoice(inv.id, {
        status,
        ...(status === "sent" ? { sent_at: new Date().toISOString() } : { paid_at: new Date().toISOString() }),
      });
      toast(status === "sent" ? t("invoice.markedSent") : t("invoice.markedPaid"), "success");
    } catch {
      toast(t("invoice.updateFailed"), "error");
    } finally {
      setBusy(null);
    }
  };

  const remove = async (inv: Invoice) => {
    const ok = await confirm({ title: t("invoice.deleteTitle"), message: t("invoice.deleteMessage"), confirmLabel: t("invoice.delete"), destructive: true });
    if (!ok) return;
    setBusy(inv.id);
    try {
      await deleteInvoice(inv.id);
      toast(t("invoice.deleted"), "success");
    } catch {
      toast(t("invoice.deleteFailed"), "error");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="min-w-0 flex-1 overflow-x-hidden bg-page divide-y divide-line">
      <div className="flex min-w-0 flex-col bg-card px-6 py-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-[20px] font-semibold tracking-[-0.01em] text-heading">{t("sidebar.invoices")}</h1>
          <Button size="sm" onClick={() => setCreateOpen(true)}>{t("invoice.new")}</Button>
        </div>

        {!loading && invoices.length === 0 ? (
          <EmptyState
            icon={FileText}
            headline={t("invoice.empty")}
            action={<Button onClick={() => setCreateOpen(true)}>{t("invoice.new")}</Button>}
          />
        ) : (
        <Table className="min-w-[860px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-md-minus text-muted-foreground">{t("table.number")}</TableHead>
              <TableHead className="text-md-minus text-muted-foreground">{t("invoice.client")}</TableHead>
              <TableHead className="text-md-minus text-muted-foreground">{t("invoice.issued")}</TableHead>
              <TableHead className="text-md-minus text-muted-foreground">{t("table.due")}</TableHead>
              <TableHead className="text-right text-md-minus text-muted-foreground">{t("invoice.total")}</TableHead>
              <TableHead className="text-md-minus text-muted-foreground">{t("table.status")}</TableHead>
              <TableHead className="text-right text-md-minus text-muted-foreground">{t("table.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={7} className="py-8 text-center text-base text-muted-foreground">
                  {t("common.loading")}
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((inv) => {
                const client = getClientById(inv.client_id);
                const disabled = busy === inv.id;
                return (
                  <TableRow
                    key={inv.id}
                    onClick={() => router.push(`/app/invoices/${inv.id}`)}
                    className="cursor-pointer border-line hover:bg-wash"
                  >
                    <TableCell className="py-2.5">
                      <Link
                        href={`/app/invoices/${inv.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-md font-semibold text-heading tnum"
                      >
                        {inv.invoice_number}
                      </Link>
                    </TableCell>
                    <TableCell className="py-2.5 text-md-minus text-muted-foreground">{client?.name ?? "—"}</TableCell>
                    <TableCell className="py-2.5 text-md-minus text-muted-foreground tnum">
                      {new Date(inv.created_at).toLocaleDateString(lang, { month: "short", day: "numeric", year: "numeric" })}
                    </TableCell>
                    <TableCell className="py-2.5 text-md-minus text-muted-foreground tnum">
                      {inv.due_date
                        ? new Date(inv.due_date).toLocaleDateString(lang, { month: "short", day: "numeric" })
                        : "—"}
                    </TableCell>
                    <TableCell className="py-2.5 text-right text-md font-semibold text-money tnum">
                      {fmtMoney(inv.total, inv.currency)}
                    </TableCell>
                    <TableCell className="py-2.5">
                      <span className={`border px-1.5 py-px text-xs font-medium ${STATUS_CLASS[inv.status]}`}>
                        {t(STATUS_LABEL_KEYS[inv.status])}
                      </span>
                    </TableCell>
                    <TableCell className="py-2.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <button type="button" disabled={disabled} onClick={(e) => { e.preventDefault(); e.stopPropagation(); share(inv); }} className="px-2 py-1 text-md-minus font-medium text-tertiary hover:text-ink disabled:opacity-50 transition-colors">{t("invoice.share")}</button>
                        {inv.status === "draft" && (
                          <button type="button" disabled={disabled} onClick={(e) => { e.preventDefault(); e.stopPropagation(); setStatus(inv, "sent"); }} className="px-2 py-1 text-md-minus font-medium text-tertiary hover:text-ink disabled:opacity-50 transition-colors">{t("invoice.markSent")}</button>
                        )}
                        {inv.status !== "paid" && (
                          <button type="button" disabled={disabled} onClick={(e) => { e.preventDefault(); e.stopPropagation(); setStatus(inv, "paid"); }} className="px-2 py-1 text-md-minus font-medium text-money hover:opacity-80 disabled:opacity-50 transition-colors">{t("invoice.markPaid")}</button>
                        )}
                        <button type="button" disabled={disabled} onClick={(e) => { e.preventDefault(); e.stopPropagation(); remove(inv); }} className="px-2 py-1 text-md-minus font-medium text-muted-foreground hover:text-destructive disabled:opacity-50 transition-colors">{t("invoice.delete")}</button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        )}
      </div>

      <CreateInvoiceDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
