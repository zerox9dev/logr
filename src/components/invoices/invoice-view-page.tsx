import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, CheckCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppData } from "@/lib/data-context";
import { t } from "@/lib/i18n";
import type { InvoiceItem, InvoiceStatus } from "@/types/database";

const STATUS_CONFIG: Record<InvoiceStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  draft: { label: "Draft", variant: "secondary" },
  sent: { label: "Sent", variant: "outline" },
  paid: { label: "Paid", variant: "default" },
  overdue: { label: "Overdue", variant: "destructive" },
};

export function InvoiceViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { invoices, getClientById, getInvoiceItems, updateInvoice, deleteInvoice, settings } = useAppData();
  const [items, setItems] = useState<InvoiceItem[]>([]);

  const invoice = invoices.find((i) => i.id === id);

  useEffect(() => {
    if (id) getInvoiceItems(id).then(setItems);
  }, [id, getInvoiceItems]);

  if (!invoice) return (
    <div className="text-center py-12">
      <p className="text-muted-foreground">Invoice not found</p>
      <Link to="/app/invoices"><Button variant="outline" className="mt-4">← Back</Button></Link>
    </div>
  );

  const client = getClientById(invoice.client_id);
  const config = STATUS_CONFIG[invoice.status];
  const sym = { USD: "$", EUR: "€", GBP: "£", UAH: "₴", PLN: "zł" }[invoice.currency || settings?.default_currency || "USD"] || "$";

  const handleDelete = async () => {
    await deleteInvoice(invoice.id);
    navigate("/app/invoices");
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <Link to="/app/invoices" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> {t("invoices.title")}
        </Link>
        <div className="flex gap-2">
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
          <Button size="sm" variant="ghost" className="text-destructive" onClick={handleDelete}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Invoice document */}
      <div className="bg-white border rounded-2xl p-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold">{settings?.company || settings?.full_name || "Your Company"}</h2>
            {settings?.email && <p className="text-xs text-muted-foreground">{settings.email}</p>}
            {settings?.address && <p className="text-xs text-muted-foreground whitespace-pre-line">{settings.address}</p>}
          </div>
          <div className="text-right">
            <p className="text-lg font-bold">INVOICE</p>
            <p className="text-sm text-muted-foreground">{invoice.invoice_number}</p>
            <Badge variant={config.variant} className="mt-2">{config.label}</Badge>
          </div>
        </div>

        {/* Dates + Client */}
        <div className="grid grid-cols-2 gap-8">
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
          <div className="text-right text-sm space-y-1">
            <p><span className="text-muted-foreground">Created:</span> {new Date(invoice.created_at).toLocaleDateString()}</p>
            {invoice.due_date && <p><span className="text-muted-foreground">Due:</span> {new Date(invoice.due_date).toLocaleDateString()}</p>}
            {invoice.sent_at && <p><span className="text-muted-foreground">Sent:</span> {new Date(invoice.sent_at).toLocaleDateString()}</p>}
            {invoice.paid_at && <p><span className="text-muted-foreground text-emerald-600">Paid:</span> {new Date(invoice.paid_at).toLocaleDateString()}</p>}
          </div>
        </div>

        {/* Items table */}
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

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-56 space-y-1.5 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">{t("invoices.subtotal")}</span><span>{sym}{Number(invoice.subtotal).toFixed(2)}</span></div>
            {invoice.tax_rate > 0 && <div className="flex justify-between"><span className="text-muted-foreground">{t("invoices.tax")} ({invoice.tax_rate}%)</span><span>{sym}{Number(invoice.tax_amount).toFixed(2)}</span></div>}
            <div className="flex justify-between font-bold text-base pt-2 border-t"><span>{t("invoices.total")}</span><span>{sym}{Number(invoice.total).toFixed(2)}</span></div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div>
            <p className="text-[10px] uppercase text-muted-foreground font-medium tracking-wider mb-1">{t("invoices.notesLabel")}</p>
            <p className="text-sm text-muted-foreground whitespace-pre-line">{invoice.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
