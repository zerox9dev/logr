import { useState } from "react";
import { useTranslation } from "react-i18next";
import { openInvoicePrintWindow } from "./InvoicePreview";
import InvoiceBuilder from "./InvoiceBuilder";

const ALL_STATUSES = ["all", "draft", "sent", "paid", "overdue", "cancelled"];

export default function InvoicesList({
  theme,
  invoices,
  clients,
  sessions,
  currency,
  onCreateInvoice,
  onUpdateInvoice,
  onDeleteInvoice,
  onUpdateSessions,
}) {
  const { t } = useTranslation();
  const [statusFilter, setStatusFilter] = useState("all");
  const [showBuilder, setShowBuilder] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [editingInvoice, setEditingInvoice] = useState(null);

  const today = new Date().toISOString().slice(0, 10);

  const filteredInvoices = invoices.filter((inv) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "overdue") {
      return inv.due_date && inv.due_date < today && inv.status === "sent";
    }
    return inv.status === statusFilter;
  });

  const STATUS_CYCLE = {
    draft: "sent",
    sent: "paid",
    paid: "draft",
    overdue: "paid",
    cancelled: "draft",
  };

  async function cycleStatus(invoice) {
    const next = STATUS_CYCLE[invoice.status] || "draft";
    const updates = {
      status: next,
      sent_at: next === "sent" ? new Date().toISOString() : invoice.sent_at,
      paid_at: next === "paid" ? new Date().toISOString() : invoice.paid_at,
    };
    await onUpdateInvoice(invoice.id, updates);

    // If marking paid, sync back to JSONB sessions
    if (next === "paid" && invoice.session_ids?.length > 0) {
      onUpdateSessions(invoice.session_ids, "PAID");
    }
  }

  async function handleDeleteDraft(invoice) {
    const confirmed = window.confirm(t("invoices.confirmDelete"));
    if (!confirmed) return;
    await onDeleteInvoice(invoice);
  }

  const statusColors = {
    draft: theme.muted,
    sent: "#2563eb",
    paid: "#059669",
    overdue: "#dc2626",
    cancelled: "#6b7280",
  };

  const btnStyle = (active) => ({
    padding: "5px 12px",
    background: active ? theme.tabActiveBg : "transparent",
    border: `1px solid ${active ? theme.tabActive : theme.border}`,
    color: active ? theme.tabActive : theme.muted,
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: 10,
    letterSpacing: "0.12em",
  });

  return (
    <div style={{ maxWidth: 720 }}>
      <div style={{ marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 9, color: theme.muted, letterSpacing: "0.2em" }}>{t("invoices.title")}</div>
        <button
          onClick={() => {
            setEditingInvoice(null);
            setShowBuilder(true);
          }}
          style={{
            padding: "6px 16px",
            background: "none",
            border: `1px dashed ${theme.border}`,
            color: theme.muted,
            cursor: "pointer",
            fontFamily: "inherit",
            fontSize: 11,
            letterSpacing: "0.1em",
          }}
        >
          + {t("invoices.new")}
        </button>
      </div>

      {/* Status filter tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        {ALL_STATUSES.map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)} style={btnStyle(statusFilter === s)}>
            {t(`invoices.status.${s}`)}
          </button>
        ))}
      </div>

      {/* Invoice list */}
      {filteredInvoices.length === 0 ? (
        <div style={{ fontSize: 13, color: theme.muted, padding: "24px 0" }}>
          {invoices.length === 0 ? t("invoices.empty") : t("invoices.noneInFilter")}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filteredInvoices.map((inv) => {
            const isExpanded = expandedId === inv.id;
            const isOverdue = inv.due_date && inv.due_date < today && inv.status === "sent";
            const displayStatus = isOverdue ? "overdue" : inv.status;

            return (
              <div key={inv.id}>
                <div
                  style={{
                    background: theme.statBg,
                    border: `1px solid ${theme.border}`,
                    padding: "14px 16px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                  }}
                  onClick={() => setExpandedId(isExpanded ? null : inv.id)}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 13, color: theme.text }}>{inv.invoice_number}</span>
                      <span
                        style={{
                          fontSize: 9,
                          padding: "2px 6px",
                          border: `1px solid ${statusColors[displayStatus] || theme.muted}`,
                          color: statusColors[displayStatus] || theme.muted,
                          letterSpacing: "0.1em",
                        }}
                      >
                        {displayStatus.toUpperCase()}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: theme.muted }}>
                      {inv.client_name}
                      {inv.issue_date && ` · ${new Date(inv.issue_date).toLocaleDateString("en-GB")}`}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 16, color: theme.text }}>
                      {inv.currency} {parseFloat(inv.total || 0).toFixed(2)}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div
                    style={{
                      border: `1px solid ${theme.border}`,
                      borderTop: "none",
                      padding: "14px 16px",
                      background: theme.bg,
                    }}
                  >
                    {/* Items */}
                    {inv.items && inv.items.length > 0 && (
                      <div style={{ marginBottom: 14 }}>
                        <div style={{ fontSize: 9, color: theme.muted, letterSpacing: "0.2em", marginBottom: 8 }}>
                          {t("invoices.items")}
                        </div>
                        {inv.items.map((item, i) => (
                          <div
                            key={i}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              padding: "6px 0",
                              borderBottom: `1px solid ${theme.border}`,
                              fontSize: 12,
                            }}
                          >
                            <span style={{ color: theme.text }}>{item.description}</span>
                            <span style={{ color: theme.muted }}>{inv.currency} {parseFloat(item.amount || 0).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {inv.notes && (
                      <div style={{ marginBottom: 14, fontSize: 12, color: theme.muted }}>{inv.notes}</div>
                    )}

                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {inv.status === "draft" && (
                        <button
                          onClick={() => {
                            setEditingInvoice(inv);
                            setShowBuilder(true);
                          }}
                          style={{
                            padding: "6px 14px",
                            background: "none",
                            border: `1px solid ${theme.border}`,
                            color: theme.muted,
                            cursor: "pointer",
                            fontFamily: "inherit",
                            fontSize: 10,
                            letterSpacing: "0.12em",
                          }}
                        >
                          {t("invoices.edit")}
                        </button>
                      )}
                      {inv.status === "draft" && (
                        <button
                          onClick={() => handleDeleteDraft(inv)}
                          style={{
                            padding: "6px 14px",
                            background: "none",
                            border: "1px solid #dc2626",
                            color: "#dc2626",
                            cursor: "pointer",
                            fontFamily: "inherit",
                            fontSize: 10,
                            letterSpacing: "0.12em",
                          }}
                        >
                          {t("invoices.delete")}
                        </button>
                      )}
                      <button
                        onClick={() => cycleStatus(inv)}
                        style={{
                          padding: "6px 14px",
                          background: "none",
                          border: `1px solid ${statusColors[STATUS_CYCLE[inv.status]] || theme.border}`,
                          color: statusColors[STATUS_CYCLE[inv.status]] || theme.muted,
                          cursor: "pointer",
                          fontFamily: "inherit",
                          fontSize: 10,
                          letterSpacing: "0.12em",
                        }}
                      >
                        → {(STATUS_CYCLE[inv.status] || "draft").toUpperCase()}
                      </button>
                      <button
                        onClick={() => openInvoicePrintWindow(inv)}
                        style={{
                          padding: "6px 14px",
                          background: "none",
                          border: `1px solid ${theme.border}`,
                          color: theme.muted,
                          cursor: "pointer",
                          fontFamily: "inherit",
                          fontSize: 10,
                          letterSpacing: "0.12em",
                        }}
                      >
                        ↓ PDF
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showBuilder && (
        <InvoiceBuilder
          theme={theme}
          clients={clients}
          sessions={sessions}
          invoices={invoices}
          currency={currency}
          initialInvoice={editingInvoice}
          onSave={(invoiceData) => {
            if (editingInvoice) return onUpdateInvoice(editingInvoice.id, invoiceData);
            return onCreateInvoice(invoiceData);
          }}
          onClose={() => {
            setShowBuilder(false);
            setEditingInvoice(null);
          }}
        />
      )}
    </div>
  );
}
