"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm";
import { useAppData } from "@/contexts/data-context";
import { useT, useLang } from "@/i18n";
import { fmtMoney } from "@/lib/format";
import { copyToClipboard } from "@/lib/clipboard";
import { encodeSharedInvoice, type SharedInvoicePayload } from "@/domain/invoice-share";
import type { InvoiceItem, InvoiceStatus } from "@/types/database";

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
  overdue: "border-red-300 bg-red-50 text-red-600",
};

/** Invoice detail: the shared-invoice layout backed by live data, plus the
 *  list page's actions (share / mark sent / mark paid / delete). */
export function InvoiceDetail({ id }: { id: string }) {
  const { invoices, loading, getClientById, getInvoiceItems, updateInvoice, deleteInvoice } = useAppData();
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const t = useT();
  const { lang } = useLang();
  const router = useRouter();
  const [items, setItems] = useState<InvoiceItem[] | null>(null);
  const [busy, setBusy] = useState(false);

  const invoice = invoices.find((i) => i.id === id);
  const exists = invoice !== undefined;

  useEffect(() => {
    if (!exists) return;
    let active = true;
    getInvoiceItems(id)
      .then((list) => { if (active) setItems(list); })
      .catch((e) => { console.error("[invoice] items failed:", e); });
    return () => { active = false; };
  }, [exists, id, getInvoiceItems]);

  if (loading || !invoice) {
    return (
      <div className="min-w-0 flex-1 overflow-x-hidden bg-page px-4 py-4 lg:px-2">
        <div className="card-radius flex min-w-0 flex-col border border-line bg-card p-6">
          <p className="py-8 text-center text-base text-muted-foreground">
            {loading ? t("common.loading") : t("invoiceDetail.notFound")}
          </p>
        </div>
      </div>
    );
  }

  const client = getClientById(invoice.client_id);
  const currency = invoice.currency;
  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString(lang, { year: "numeric", month: "short", day: "numeric" });

  const share = async () => {
    setBusy(true);
    try {
      const list = await getInvoiceItems(invoice.id);
      const payload: SharedInvoicePayload = {
        version: 1,
        invoiceNumber: invoice.invoice_number,
        status: invoice.status,
        currency: invoice.currency,
        clientName: client?.name ?? "",
        issuedAt: invoice.created_at,
        dueDate: invoice.due_date,
        notes: invoice.notes,
        items: list.map((i) => ({ description: i.description, quantity: i.quantity, rate: i.rate, amount: i.amount })),
        subtotal: invoice.subtotal,
        taxRate: invoice.tax_rate,
        taxAmount: invoice.tax_amount,
        total: invoice.total,
      };
      const url = `${window.location.origin}/share/invoice?data=${encodeSharedInvoice(payload)}`;
      await copyToClipboard(url);
      toast(t("invoice.shareCopied"), "success");
    } catch (e) {
      console.error("[invoice] share failed:", e);
      toast(t("invoice.updateFailed"), "error");
    } finally {
      setBusy(false);
    }
  };

  const setStatus = async (status: "sent" | "paid") => {
    setBusy(true);
    try {
      await updateInvoice(invoice.id, {
        status,
        ...(status === "sent" ? { sent_at: new Date().toISOString() } : { paid_at: new Date().toISOString() }),
      });
      toast(status === "sent" ? t("invoice.markedSent") : t("invoice.markedPaid"), "success");
    } catch {
      toast(t("invoice.updateFailed"), "error");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    const ok = await confirm({
      title: t("invoice.deleteTitle"),
      message: t("invoice.deleteMessage"),
      confirmLabel: t("invoice.delete"),
      destructive: true,
    });
    if (!ok) return;
    setBusy(true);
    try {
      await deleteInvoice(invoice.id);
      toast(t("invoice.deleted"), "success");
      router.push("/app/invoices");
    } catch {
      toast(t("invoice.deleteFailed"), "error");
      setBusy(false);
    }
  };

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4 overflow-x-hidden bg-page px-4 py-4 lg:px-2">
      <div className="card-radius flex min-w-0 flex-col gap-7 border border-line bg-card p-6">
        <div className="flex flex-col gap-4">
          <Link href="/app/invoices" className="text-md-minus text-muted-foreground transition-colors hover:text-ink">
            ← {t("sidebar.invoices")}
          </Link>
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-widget font-semibold text-heading tnum">{invoice.invoice_number}</h1>
                <span className={`shrink-0 border px-1.5 py-px text-xs font-medium ${STATUS_CLASS[invoice.status]}`}>
                  {t(STATUS_LABEL_KEYS[invoice.status])}
                </span>
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-1.5">
              <Button size="sm" variant="outline" disabled={busy} onClick={share}>{t("invoice.share")}</Button>
              {invoice.status === "draft" && (
                <Button size="sm" variant="outline" disabled={busy} onClick={() => setStatus("sent")}>{t("invoice.markSent")}</Button>
              )}
              {invoice.status !== "paid" && (
                <Button size="sm" variant="outline" disabled={busy} onClick={() => setStatus("paid")}>{t("invoice.markPaid")}</Button>
              )}
              <Button size="sm" variant="destructive" disabled={busy} onClick={remove}>{t("invoice.delete")}</Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-y border-line py-4 md:grid-cols-3">
          <div className="flex min-w-0 flex-col gap-1">
            <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{t("invoice.billedTo")}</span>
            {client ? (
              <Link href={`/app/clients/${client.id}`} className="truncate text-md font-medium text-heading transition-colors hover:text-brand">
                {client.name}
              </Link>
            ) : (
              <span className="text-md font-medium text-heading">—</span>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{t("invoice.issued")}</span>
            <span className="text-md text-ink tnum">{fmtDate(invoice.created_at)}</span>
          </div>
          {invoice.due_date && (
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{t("invoice.dueDate")}</span>
              <span className="text-md text-ink tnum">{fmtDate(invoice.due_date)}</span>
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-col overflow-x-auto">
          <div className="flex min-w-[520px] flex-col">
            <div className="flex items-center gap-3 border-b border-line pb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              <span className="min-w-0 flex-1">{t("invoice.description")}</span>
              <span className="w-[88px] shrink-0 text-right">{t("invoice.qty")}</span>
              <span className="w-[88px] shrink-0 text-right">{t("invoice.rate")}</span>
              <span className="w-[96px] shrink-0 text-right">{t("invoice.amount")}</span>
            </div>
            {items === null ? (
              <p className="py-4 text-md text-muted-foreground">{t("common.loading")}</p>
            ) : items.length === 0 ? (
              <p className="py-4 text-md text-muted-foreground">{t("invoiceDetail.noItems")}</p>
            ) : (
              items.map((it) => (
                <div key={it.id} className="flex items-center gap-3 border-b border-line py-2.5 text-md last:border-0">
                  <span className="min-w-0 flex-1 truncate text-heading">{it.description}</span>
                  <span className="w-[88px] shrink-0 text-right text-tertiary tnum">{it.quantity}</span>
                  <span className="w-[88px] shrink-0 text-right text-tertiary tnum">{fmtMoney(it.rate, currency)}</span>
                  <span className="w-[96px] shrink-0 text-right font-medium text-ink tnum">{fmtMoney(it.amount, currency)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <div className="flex w-full max-w-[280px] flex-col gap-1.5">
            <div className="flex justify-between text-md text-tertiary">
              <span>{t("invoice.subtotal")}</span>
              <span className="tnum">{fmtMoney(invoice.subtotal, currency)}</span>
            </div>
            {invoice.tax_amount > 0 && (
              <div className="flex justify-between text-md text-tertiary">
                <span>{t("invoice.taxAmount")}{invoice.tax_rate ? ` (${invoice.tax_rate}%)` : ""}</span>
                <span className="tnum">{fmtMoney(invoice.tax_amount, currency)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-line pt-1.5 text-xl font-semibold text-heading">
              <span>{t("invoice.total")}</span>
              <span className="tnum">{fmtMoney(invoice.total, currency)}</span>
            </div>
          </div>
        </div>

        {invoice.notes && (
          <div className="flex flex-col gap-1 border-t border-line pt-4">
            <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{t("invoice.notes")}</span>
            <p className="whitespace-pre-wrap text-md text-ink">{invoice.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
