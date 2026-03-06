import { useState, useEffect } from "react";
import { Plus, Trash2, Send, CheckCircle, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAppData } from "@/lib/data-context";
import type { InvoiceStatus, Invoice, InvoiceItem } from "@/types/database";
import { t } from "@/lib/i18n";

const STATUS_CONFIG: Record<InvoiceStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  draft: { label: "Draft", variant: "secondary" },
  sent: { label: "Sent", variant: "outline" },
  paid: { label: "Paid", variant: "default" },
  overdue: { label: "Overdue", variant: "destructive" },
};

function InvoiceModal({ invoice, onClose }: { invoice: Invoice; onClose: () => void }) {
  const { getClientById, getInvoiceItems, updateInvoice, deleteInvoice, settings } = useAppData();
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const client = getClientById(invoice.client_id);
  const config = STATUS_CONFIG[invoice.status];
  const sym = { USD: "$", EUR: "€", GBP: "£", UAH: "₴", PLN: "zł" }[invoice.currency || settings?.default_currency || "USD"] || "$";

  useEffect(() => { getInvoiceItems(invoice.id).then(setItems); }, [invoice.id, getInvoiceItems]);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-background rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Top bar */}
        <div className="sticky top-0 bg-background/95 backdrop-blur border-b px-6 py-3 flex items-center justify-between rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            <span className="font-semibold">{invoice.invoice_number}</span>
            <Badge variant={config.variant}>{config.label}</Badge>
          </div>
          <div className="flex items-center gap-2">
            {invoice.status === "draft" && (
              <Button size="sm" variant="outline" onClick={() => updateInvoice(invoice.id, { status: "sent", sent_at: new Date().toISOString() })}>
                <Send className="h-3.5 w-3.5" /> {t("invoices.send")}
              </Button>
            )}
            {(invoice.status === "sent" || invoice.status === "overdue") && (
              <Button size="sm" onClick={() => updateInvoice(invoice.id, { status: "paid", paid_at: new Date().toISOString() })}>
                <CheckCircle className="h-3.5 w-3.5" /> {t("invoices.markPaid")}
              </Button>
            )}
            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => { deleteInvoice(invoice.id); onClose(); }}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Invoice document */}
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-lg font-bold">{settings?.company || settings?.full_name || "Your Company"}</h2>
              {settings?.email && <p className="text-xs text-muted-foreground">{settings.email}</p>}
              {settings?.address && <p className="text-xs text-muted-foreground whitespace-pre-line">{settings.address}</p>}
            </div>
            <div className="text-right text-sm space-y-0.5">
              <p><span className="text-muted-foreground">Created:</span> {new Date(invoice.created_at).toLocaleDateString()}</p>
              {invoice.due_date && <p><span className="text-muted-foreground">Due:</span> {new Date(invoice.due_date).toLocaleDateString()}</p>}
              {invoice.sent_at && <p><span className="text-muted-foreground">Sent:</span> {new Date(invoice.sent_at).toLocaleDateString()}</p>}
              {invoice.paid_at && <p className="text-emerald-600">Paid: {new Date(invoice.paid_at).toLocaleDateString()}</p>}
            </div>
          </div>

          <div>
            <p className="text-[10px] uppercase text-muted-foreground font-medium tracking-wider mb-1">{t("invoices.billTo")}</p>
            {client ? (
              <div>
                <p className="font-medium">{client.name}</p>
                {client.company && <p className="text-xs text-muted-foreground">{client.company}</p>}
                {client.email && <p className="text-xs text-muted-foreground">{client.email}</p>}
                {client.address && <p className="text-xs text-muted-foreground">{client.address}</p>}
              </div>
            ) : <p className="text-xs text-muted-foreground">{t("invoices.noClient")}</p>}
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-[10px] uppercase text-muted-foreground tracking-wider">
                <th className="text-left py-2 font-medium">Description</th>
                <th className="text-right py-2 font-medium w-16">{t("invoices.qty")}</th>
                <th className="text-right py-2 font-medium w-20">Rate</th>
                <th className="text-right py-2 font-medium w-24">{t("invoices.amount")}</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan={4} className="py-6 text-center text-muted-foreground text-xs">{t("common.loading")}</td></tr>
              ) : items.map((item) => (
                <tr key={item.id} className="border-b border-border/50">
                  <td className="py-2.5">{item.description}</td>
                  <td className="py-2.5 text-right">{item.quantity}</td>
                  <td className="py-2.5 text-right">{sym}{Number(item.rate).toFixed(2)}</td>
                  <td className="py-2.5 text-right font-medium">{sym}{Number(item.amount).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end">
            <div className="w-56 space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">{t("invoices.subtotal")}</span><span>{sym}{Number(invoice.subtotal).toFixed(2)}</span></div>
              {invoice.tax_rate > 0 && <div className="flex justify-between"><span className="text-muted-foreground">{t("invoices.tax")} ({invoice.tax_rate}%)</span><span>{sym}{Number(invoice.tax_amount).toFixed(2)}</span></div>}
              <div className="flex justify-between font-bold text-base pt-2 border-t"><span>{t("invoices.total")}</span><span>{sym}{Number(invoice.total).toFixed(2)}</span></div>
            </div>
          </div>

          {invoice.notes && (
            <div>
              <p className="text-[10px] uppercase text-muted-foreground font-medium tracking-wider mb-1">{t("invoices.notesLabel")}</p>
              <p className="text-sm text-muted-foreground whitespace-pre-line">{invoice.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function InvoicesPage() {
  const { invoices, updateInvoice, deleteInvoice, getClientById } = useAppData();
  const [filter, setFilter] = useState<"all" | InvoiceStatus>("all");
  const [viewId, setViewId] = useState<string | null>(null);

  const filtered = filter === "all" ? invoices : invoices.filter((i) => i.status === filter);
  const unpaidTotal = invoices.filter((i) => i.status !== "paid").reduce((s, i) => s + Number(i.total), 0);
  const viewInvoice = viewId ? invoices.find((i) => i.id === viewId) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("invoices.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {invoices.length} {t("invoices.title").toLowerCase()}
            {unpaidTotal > 0 && <> · ${unpaidTotal.toFixed(0)} {t("invoices.unpaid")}</>}
          </p>
        </div>
        <Link to="/app/invoices/new">
          <Button><Plus className="h-4 w-4" /> {t("invoices.new")}</Button>
        </Link>
      </div>

      <div className="flex gap-1">
        {(["all", "draft", "sent", "paid", "overdue"] as const).map((s) => (
          <Button key={s} variant={filter === s ? "default" : "ghost"} size="sm"
            onClick={() => setFilter(s)} className="capitalize">{s}</Button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((invoice) => {
          const client = getClientById(invoice.client_id);
          const config = STATUS_CONFIG[invoice.status];
          return (
            <Card key={invoice.id} className="group hover:bg-accent/40 transition-colors cursor-pointer" onClick={() => setViewId(invoice.id)}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{invoice.invoice_number}</p>
                    <Badge variant={config.variant}>{config.label}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {client?.name || "No client"} · {invoice.currency} {Number(invoice.total).toFixed(2)}
                    {invoice.due_date && ` · Due ${new Date(invoice.due_date).toLocaleDateString()}`}
                  </p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {invoice.status === "draft" && (
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); updateInvoice(invoice.id, { status: "sent", sent_at: new Date().toISOString() }); }}>
                      <Send className="h-3 w-3" /> {t("invoices.send")}
                    </Button>
                  )}
                  {(invoice.status === "sent" || invoice.status === "overdue") && (
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); updateInvoice(invoice.id, { status: "paid", paid_at: new Date().toISOString() }); }}>
                      <CheckCircle className="h-3 w-3" /> {t("invoices.markPaid")}
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); deleteInvoice(invoice.id); }}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filtered.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">{t("invoices.noInvoices")}</p>}
      </div>

      {viewInvoice && <InvoiceModal invoice={viewInvoice} onClose={() => setViewId(null)} />}
    </div>
  );
}
