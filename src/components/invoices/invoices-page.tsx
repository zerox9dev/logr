import { useState, useEffect } from "react";
import { Plus, Trash2, Send, CheckCircle, X, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppData } from "@/lib/data-context";
import type { InvoiceStatus, Invoice, InvoiceItem } from "@/types/database";
import { t } from "@/lib/i18n";
import sh from "@/components/shared.module.css";
import s from "./invoices-page.module.css";

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
  
  const todayStr = new Date().toISOString().slice(0, 10);
  const effectiveStatus = (invoice.status === "sent" && invoice.due_date && invoice.due_date < todayStr) ? "overdue" : invoice.status;
  const config = STATUS_CONFIG[effectiveStatus];
  
  const sym = { USD: "$", EUR: "€", GBP: "£", UAH: "₴", PLN: "zł" }[invoice.currency || settings?.default_currency || "USD"] || "$";

  useEffect(() => { getInvoiceItems(invoice.id).then(setItems); }, [invoice.id, getInvoiceItems]);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className={s.modal}>
      <div className={s.modalBackdrop} onClick={onClose} />
      <div className={s.modalPanel}>
        <div className={s.modalTop}>
          <div className={s.modalTopLeft}>
            <span style={{ fontWeight: 600 }}>{invoice.invoice_number}</span>
            <Badge variant={config.variant}>{config.label}</Badge>
          </div>
          <div className={s.modalTopRight}>
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
            <Button size="sm" variant="ghost" style={{ color: "var(--destructive)" }} onClick={() => { deleteInvoice(invoice.id); onClose(); }}>
              <Trash2 style={{ width: 14, height: 14 }} />
            </Button>
            <Button size="icon" variant="ghost" style={{ width: 32, height: 32 }} onClick={onClose}>
              <X style={{ width: 16, height: 16 }} />
            </Button>
          </div>
        </div>

        <div className={s.modalBody}>
          <div className={s.docHeader}>
            <div>
              <h2 className={s.docCompany}>{settings?.company || settings?.full_name || "Your Company"}</h2>
              {settings?.email && <p className={s.docSmall}>{settings.email}</p>}
              {settings?.address && <p className={[s.docSmall, s.docSmallPre].join(" ")}>{settings.address}</p>}
            </div>
            <div className={[s.docRight, s.docDates].join(" ")}>
              <p><span className={s.docDateLabel}>Created:</span> {new Date(invoice.created_at).toLocaleDateString()}</p>
              {invoice.due_date && <p><span className={s.docDateLabel}>Due:</span> {new Date(invoice.due_date).toLocaleDateString()}</p>}
              {invoice.sent_at && <p><span className={s.docDateLabel}>Sent:</span> {new Date(invoice.sent_at).toLocaleDateString()}</p>}
              {invoice.paid_at && <p className={s.docDatePaid}>Paid: {new Date(invoice.paid_at).toLocaleDateString()}</p>}
            </div>
          </div>

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
              <p className={[s.docSmall, s.docSmallPre].join(" ")}>{invoice.notes}</p>
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

  const todayStr = new Date().toISOString().slice(0, 10);
  
  const getEffectiveStatus = (invoice: Invoice): InvoiceStatus => {
    if (invoice.status === "sent" && invoice.due_date && invoice.due_date < todayStr) {
      return "overdue";
    }
    return invoice.status;
  };

  const filtered = filter === "all" 
    ? invoices 
    : invoices.filter((i) => {
        const status = getEffectiveStatus(i);
        return status === filter;
      });
      
  const unpaidTotal = invoices.filter((i) => i.status !== "paid").reduce((sum, i) => sum + Number(i.total), 0);
  const viewInvoice = viewId ? invoices.find((i) => i.id === viewId) : null;

  return (
    <div className={sh.page}>
      <div className={sh.header}>
        <div>
          <h1 className={sh.title}>{t("invoices.title")}</h1>
          <p className={sh.subtitle}>
            {invoices.length} {t("invoices.title").toLowerCase()}
            {unpaidTotal > 0 && <> · ${unpaidTotal.toFixed(0)} {t("invoices.unpaid")}</>}
          </p>
        </div>
        <Link to="/app/invoices/new">
          <Button><Plus style={{ width: 16, height: 16 }} /> {t("invoices.new")}</Button>
        </Link>
      </div>

      <div className={sh.filterBar}>
        {(["all", "draft", "sent", "paid", "overdue"] as const).map((st) => (
          <Button key={st} variant={filter === st ? "default" : "ghost"} size="sm"
            onClick={() => setFilter(st)} style={{ textTransform: "capitalize" }}>{st}</Button>
        ))}
      </div>

      <div className={s.tableWrap}>
        <table className={s.listTable}>
          <thead>
            <tr>
              <th>{t("invoices.title")}</th>
              <th>{t("projects.client")}</th>
              <th>{t("projects.status")}</th>
              <th>{t("invoices.amount")}</th>
              <th>{t("invoices.dueDate")}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((invoice) => {
              const client = getClientById(invoice.client_id);
              const status = getEffectiveStatus(invoice);
              const config = STATUS_CONFIG[status];
              return (
                <tr key={invoice.id} className={s.clickableRow} onClick={() => setViewId(invoice.id)}>
                  <td className={s.nameCell}>{invoice.invoice_number}</td>
                  <td className={s.mutedCell}>{client?.name || "—"}</td>
                  <td><Badge variant={config.variant}>{config.label}</Badge></td>
                  <td className={s.amountCell}>{invoice.currency} {Number(invoice.total).toFixed(2)}</td>
                  <td className={s.mutedCell}>{invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : "—"}</td>
                  <td className={s.actionsCell}>
                    {invoice.status === "draft" && (
                      <button className={s.actionBtn} onClick={(e) => { e.stopPropagation(); updateInvoice(invoice.id, { status: "sent", sent_at: new Date().toISOString() }); }} title="Send">
                        <Send style={{ width: 14, height: 14 }} />
                      </button>
                    )}
                    {(invoice.status === "sent" || status === "overdue") && (
                      <button className={s.actionBtn} onClick={(e) => { e.stopPropagation(); updateInvoice(invoice.id, { status: "paid", paid_at: new Date().toISOString() }); }} title="Mark paid">
                        <CheckCircle style={{ width: 14, height: 14 }} />
                      </button>
                    )}
                    <button className={s.actionBtn} onClick={(e) => { e.stopPropagation(); window.open(`/app/invoices/${invoice.id}?print=1`, '_blank'); }} title="Download PDF">
                      <Download style={{ width: 14, height: 14 }} />
                    </button>
                    <button className={s.actionBtn} onClick={(e) => { e.stopPropagation(); deleteInvoice(invoice.id); }} title="Delete">
                      <Trash2 style={{ width: 14, height: 14 }} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <p className={sh.emptyText}>{t("invoices.noInvoices")}</p>}
      </div>

      {viewInvoice && <InvoiceModal invoice={viewInvoice} onClose={() => setViewId(null)} />}
    </div>
  );
}
