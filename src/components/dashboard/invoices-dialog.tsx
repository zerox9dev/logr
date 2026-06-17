import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm";
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
  draft: "border-line text-muted",
  sent: "border-brand/30 bg-brand-soft text-brand",
  paid: "border-money/30 bg-brand-faint text-money",
  overdue: "border-red-300 bg-red-50 text-red-600",
};

export function InvoicesDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { invoices, getClientById, getInvoiceItems, updateInvoice, deleteInvoice } = useAppData();
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const t = useT();
  const { lang } = useLang();
  const [busy, setBusy] = useState<string | null>(null);

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
    <Dialog open={open} onClose={onClose} title={t("invoice.manage")} wide>
      {invoices.length === 0 ? (
        <p className="py-8 text-center text-base text-muted">{t("invoice.empty")}</p>
      ) : (
        <div className="flex max-h-[60vh] flex-col gap-px overflow-auto">
          {invoices.map((inv) => {
            const client = getClientById(inv.client_id);
            const disabled = busy === inv.id;
            return (
              <div key={inv.id} className="flex flex-wrap items-center gap-3 border-b border-line py-2.5 last:border-0">
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="text-md font-semibold text-heading tnum">{inv.invoice_number}</span>
                    <span className={`shrink-0 border px-1.5 py-px text-xs font-medium ${STATUS_CLASS[inv.status]}`}>{t(STATUS_LABEL_KEYS[inv.status])}</span>
                  </div>
                  <span className="truncate text-md-minus text-muted">
                    {client?.name ?? "—"} · {new Date(inv.created_at).toLocaleDateString(lang, { month: "short", day: "numeric", year: "numeric" })}
                    {inv.due_date ? ` · ${t("invoice.due").replace("{date}", new Date(inv.due_date).toLocaleDateString(lang, { month: "short", day: "numeric" }))}` : ""}
                  </span>
                </div>
                <span className="w-[96px] shrink-0 text-right text-md font-semibold text-money tnum">{fmtMoney(inv.total, inv.currency)}</span>
                <div className="flex shrink-0 items-center gap-1.5">
                  <Button variant="unstyled" size="unstyled" disabled={disabled} onClick={() => share(inv)} className="px-2 py-1 text-md-minus font-medium text-tertiary hover:text-ink disabled:opacity-50">{t("invoice.share")}</Button>
                  {inv.status === "draft" && (
                    <Button variant="unstyled" size="unstyled" disabled={disabled} onClick={() => setStatus(inv, "sent")} className="px-2 py-1 text-md-minus font-medium text-tertiary hover:text-ink disabled:opacity-50">{t("invoice.markSent")}</Button>
                  )}
                  {inv.status !== "paid" && (
                    <Button variant="unstyled" size="unstyled" disabled={disabled} onClick={() => setStatus(inv, "paid")} className="px-2 py-1 text-md-minus font-medium text-money hover:opacity-80 disabled:opacity-50">{t("invoice.markPaid")}</Button>
                  )}
                  <Button variant="unstyled" size="unstyled" disabled={disabled} onClick={() => remove(inv)} className="px-2 py-1 text-md-minus font-medium text-muted hover:text-red-600 disabled:opacity-50">{t("invoice.delete")}</Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Dialog>
  );
}
