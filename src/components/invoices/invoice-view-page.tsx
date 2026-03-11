import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, CheckCircle, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppData } from "@/lib/data-context";
import { t } from "@/lib/i18n";
import type { InvoiceItem, InvoiceStatus } from "@/types/database";
import s from "./invoices-page.module.css";
import sh from "@/components/shared.module.css";

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
    <div style={{ textAlign: "center", padding: "3rem 0" }}>
      <p style={{ color: "var(--muted-foreground)" }}>{t("common.noData")}</p>
      <Link to="/app/invoices"><Button variant="outline" style={{ marginTop: "1rem" }}>← Back</Button></Link>
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
    <div className={sh.page} style={{ maxWidth: "48rem" }}>
      <div className={sh.header}>
        <Link to="/app/invoices" style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "var(--muted-foreground)", transition: "color 0.15s" }}>
          <ArrowLeft style={{ width: 16, height: 16 }} /> {t("invoices.title")}
        </Link>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {invoice.status === "draft" && (
            <Button size="sm" variant="outline" onClick={() => navigate(`/app/invoices/${invoice.id}/edit`)}>
              <Pencil style={{ width: 14, height: 14 }} /> {t("common.edit")}
            </Button>
          )}
          {invoice.status === "draft" && (
            <Button size="sm" variant="outline" onClick={() => updateInvoice(invoice.id, { status: "sent", sent_at: new Date().toISOString() })}>
              <Send style={{ width: 14, height: 14 }} /> {t("invoices.send")}
            </Button>
          )}
          {(invoice.status === "sent" || invoice.status === "overdue") && (
            <Button size="sm" onClick={() => updateInvoice(invoice.id, { status: "paid", paid_at: new Date().toISOString() })}>
              <CheckCircle style={{ width: 14, height: 14 }} /> {t("invoices.markPaid")}
            </Button>
          )}
          <Button size="sm" variant="ghost" style={{ color: "var(--destructive)" }} onClick={handleDelete}>
            <Trash2 style={{ width: 14, height: 14 }} />
          </Button>
        </div>
      </div>

      <div style={{ background: "var(--white)", border: "1px solid var(--border)", borderRadius: "1rem", padding: "2rem", display: "flex", flexDirection: "column", gap: "2rem" }}>
        <div className={s.docHeader}>
          <div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>{settings?.company || settings?.full_name || "Your Company"}</h2>
            {settings?.email && <p className={s.docSmall}>{settings.email}</p>}
            {settings?.address && <p className={[s.docSmall, s.docSmallPre].join(" ")}>{settings.address}</p>}
          </div>
          <div className={s.docRight}>
            <p style={{ fontSize: "1.125rem", fontWeight: 700 }}>INVOICE</p>
            <p style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>{invoice.invoice_number}</p>
            <Badge variant={config.variant} style={{ marginTop: "0.5rem" }}>{config.label}</Badge>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
          <div>
            <p className={s.docSectionLabel}>{t("invoices.billTo")}</p>
            {client ? (
              <div>
                <p style={{ fontWeight: 500 }}>{client.name}</p>
                {client.company && <p className={s.docSmall}>{client.company}</p>}
                {client.email && <p className={s.docSmall}>{client.email}</p>}
                {client.address && <p className={s.docSmall}>{client.address}</p>}
              </div>
            ) : <p className={s.docSmall}>{t("invoices.noClient")}</p>}
          </div>
          <div className={[s.docRight, s.docDates].join(" ")} style={{ fontSize: "0.875rem" }}>
            <p><span className={s.docDateLabel}>Created:</span> {new Date(invoice.created_at).toLocaleDateString()}</p>
            {invoice.due_date && <p><span className={s.docDateLabel}>Due:</span> {new Date(invoice.due_date).toLocaleDateString()}</p>}
            {invoice.sent_at && <p><span className={s.docDateLabel}>Sent:</span> {new Date(invoice.sent_at).toLocaleDateString()}</p>}
            {invoice.paid_at && <p><span className={s.docDatePaid}>Paid:</span> {new Date(invoice.paid_at).toLocaleDateString()}</p>}
          </div>
        </div>

        <table className={s.docTable}>
          <thead>
            <tr>
              <th className={s.docTh}>{t("timer.description")}</th>
              <th className={[s.docTh, s.docThRight].join(" ")} style={{ width: 64 }}>{t("invoices.qty")}</th>
              <th className={[s.docTh, s.docThRight].join(" ")} style={{ width: 80 }}>{t("projects.rate")}</th>
              <th className={[s.docTh, s.docThRight].join(" ")} style={{ width: 96 }}>{t("invoices.amount")}</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={4} className={s.docEmpty}>{t("common.loading")}</td></tr>
            ) : items.map((item) => (
              <tr key={item.id}>
                <td className={s.docTd}>{item.description}</td>
                <td className={[s.docTd, s.docTdRight].join(" ")}>{item.quantity}</td>
                <td className={[s.docTd, s.docTdRight].join(" ")}>{sym}{Number(item.rate).toFixed(2)}</td>
                <td className={[s.docTd, s.docTdRight, s.docTdBold].join(" ")}>{sym}{Number(item.amount).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className={s.docTotals}>
          <div className={s.docTotalsInner}>
            <div className={s.docTotalRow}><span className={s.docTotalLabel}>{t("invoices.subtotal")}</span><span>{sym}{Number(invoice.subtotal).toFixed(2)}</span></div>
            {invoice.tax_rate > 0 && <div className={s.docTotalRow}><span className={s.docTotalLabel}>{t("invoices.tax")} ({invoice.tax_rate}%)</span><span>{sym}{Number(invoice.tax_amount).toFixed(2)}</span></div>}
            <div className={s.docTotalFinal}><span>{t("invoices.total")}</span><span>{sym}{Number(invoice.total).toFixed(2)}</span></div>
          </div>
        </div>

        {invoice.notes && (
          <div>
            <p className={s.docSectionLabel}>{t("invoices.notesLabel")}</p>
            <p style={{ fontSize: "0.875rem", color: "var(--muted-foreground)", whiteSpace: "pre-line" }}>{invoice.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
