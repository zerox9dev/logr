import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { ClientPicker } from "@/components/shared/client-picker";
import { useAppData } from "@/contexts/data-context";
import { useT, useLang } from "@/i18n";
import { fmtMoney, fmtDuration } from "@/lib/format";
import { unbilledSessions, sessionToInvoiceItem, computeInvoiceTotals, nextInvoiceNumber } from "@/domain/invoicing";

export function CreateInvoiceDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { clients, sessions, invoices, settings, addInvoice, billedSessionIds } = useAppData();
  const { toast } = useToast();
  const t = useT();
  const { lang } = useLang();

  const [clientId, setClientId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [taxRate, setTaxRate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [saving, setSaving] = useState(false);

  const currency = settings?.default_currency ?? "USD";
  const units = { hr: t("unit.hr"), min: t("unit.min") };

  const unbilled = useMemo(
    () => (clientId ? unbilledSessions(sessions, clientId, billedSessionIds) : []),
    [clientId, sessions, billedSessionIds],
  );

  const pickClient = (id: string) => {
    setClientId(id);
    setSelected(new Set(unbilledSessions(sessions, id, billedSessionIds).map((s) => s.id)));
  };

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const items = unbilled.filter((s) => selected.has(s.id)).map(sessionToInvoiceItem);
  const totals = computeInvoiceTotals(items, Number(taxRate) || 0);
  const clientName = clients.find((c) => c.id === clientId)?.name ?? t("invoice.selectClient");

  const reset = () => { setClientId(null); setSelected(new Set()); setTaxRate(""); setDueDate(""); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || items.length === 0 || saving) return;
    setSaving(true);
    try {
      await addInvoice(
        {
          client_id: clientId,
          invoice_number: nextInvoiceNumber(invoices),
          subtotal: totals.subtotal,
          tax_rate: Number(taxRate) || 0,
          tax_amount: totals.tax_amount,
          total: totals.total,
          currency,
          status: "draft",
          due_date: dueDate || null,
          sent_at: null,
          paid_at: null,
          notes: null,
        },
        items,
      );
      toast(t("invoice.created"), "success");
      reset();
      onClose();
    } catch {
      toast(t("invoice.createFailed"), "error");
    } finally {
      setSaving(false);
    }
  };

  const close = () => { reset(); onClose(); };

  if (clients.length === 0) {
    return (
      <Dialog open={open} onClose={close} title={t("invoice.title")}>
        <p className="py-4 text-center text-md text-tertiary">{t("invoice.noClients")}</p>
        <div className="flex justify-end"><Button type="button" variant="outline" onClick={close}>{t("invoice.cancel")}</Button></div>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={close} title={t("invoice.title")} wide>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-md-minus text-muted-foreground">{t("invoice.client")}</span>
          <ClientPicker
            clients={clients}
            onChange={pickClient}
            trigger={
              <Button type="button" variant="outline" size="default" className="w-full justify-between">
                <span className={`line-clamp-1 min-w-0 ${clientId ? "text-ink" : "text-muted-foreground"}`}>{clientName}</span>
                <span aria-hidden="true" className="shrink-0 text-muted-foreground">▾</span>
              </Button>
            }
          />
        </label>

        {clientId && (
          <>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-md-minus text-muted-foreground">{t("invoice.unbilled")}</span>
                {unbilled.length > 0 && (
                  <span className="text-md-minus text-muted-foreground">{t("invoice.selected").replace("{n}", String(selected.size))}</span>
                )}
              </div>
              {unbilled.length === 0 ? (
                <p className="py-3 text-center text-md text-muted-foreground">{t("invoice.noUnbilled")}</p>
              ) : (
                <div className="flex max-h-[40vh] flex-col gap-px overflow-auto border border-line">
                  {unbilled.map((s) => {
                    const amount = (s.duration_seconds / 3600) * s.rate;
                    return (
                      <label key={s.id} className="flex cursor-pointer items-center gap-3 border-b border-line bg-card px-3 py-2.5 last:border-0 hover:bg-wash">
                        <input type="checkbox" checked={selected.has(s.id)} onChange={() => toggle(s.id)} className="size-4 shrink-0 accent-brand" />
                        <span className="w-[64px] shrink-0 text-md-minus text-muted-foreground tnum">
                          {new Date(s.started_at).toLocaleDateString(lang, { month: "short", day: "numeric" })}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-md text-heading">{s.name}</span>
                        <span className="w-[88px] shrink-0 text-right text-md-minus text-tertiary tnum">{fmtDuration(s.duration_seconds, units)}</span>
                        <span className="w-[80px] shrink-0 text-right text-md font-semibold text-money tnum">{fmtMoney(amount, currency)}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <label className="flex w-28 flex-col gap-1.5">
                <span className="text-md-minus text-muted-foreground">{t("invoice.tax")}</span>
                <Input type="number" min="0" max="100" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} placeholder="0" />
              </label>
              <label className="flex flex-1 flex-col gap-1.5">
                <span className="text-md-minus text-muted-foreground">{t("invoice.dueDate")}</span>
                <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </label>
            </div>

            <div className="flex flex-col gap-1 border-t border-line pt-3 text-md">
              <div className="flex justify-between text-tertiary"><span>{t("invoice.subtotal")}</span><span className="tnum">{fmtMoney(totals.subtotal, currency)}</span></div>
              {totals.tax_amount > 0 && (
                <div className="flex justify-between text-tertiary"><span>{t("invoice.taxAmount")}</span><span className="tnum">{fmtMoney(totals.tax_amount, currency)}</span></div>
              )}
              <div className="flex justify-between text-lg font-semibold text-heading"><span>{t("invoice.total")}</span><span className="tnum">{fmtMoney(totals.total, currency)}</span></div>
            </div>
          </>
        )}

        <div className="flex justify-end gap-2.5 pt-1">
          <Button type="button" variant="outline" onClick={close}>{t("invoice.cancel")}</Button>
          <Button type="submit" disabled={!clientId || items.length === 0 || saving}>{t("invoice.create")}</Button>
        </div>
      </form>
    </Dialog>
  );
}
