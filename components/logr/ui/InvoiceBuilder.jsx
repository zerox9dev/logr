import { useState } from "react";
import { useTranslation } from "react-i18next";
import { formatMoney, formatDate, formatInvoiceNumber } from "../lib/utils";

const STEPS = ["client", "sessions", "details", "preview"];

export default function InvoiceBuilder({
  theme,
  clients,
  sessions,
  invoices,
  currency,
  user,
  onSave,
  onClose,
}) {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedSessionIds, setSelectedSessionIds] = useState(new Set());
  const [invoiceNumber, setInvoiceNumber] = useState(
    formatInvoiceNumber(new Date().getFullYear(), (invoices?.length || 0) + 1)
  );
  const [issueDate, setIssueDate] = useState(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState("");
  const [taxRate, setTaxRate] = useState("0");
  const [invoiceNotes, setInvoiceNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const selectedClient = clients.find((c) => c.id === selectedClientId);
  const clientSessions = sessions.filter(
    (s) =>
      s.clientId === selectedClientId &&
      s.status === "DONE" &&
      (s.paymentStatus || "UNPAID") === "UNPAID"
  );

  const selectedSessions = clientSessions.filter((s) => selectedSessionIds.has(s.id));

  const countedProjects = new Set();
  const items = selectedSessions.map((s) => {
    const project = (clients.find((c) => c.id === s.clientId)?.projects || []).find(
      (p) => p.id === s.projectId
    );
    const billingType = s.billingType || "hourly";
    let amount = parseFloat(s.earned || 0);
    if (billingType === "fixed_project") {
      if (s.projectId && !countedProjects.has(s.projectId)) {
        amount = parseFloat(s.fixedAmount || 0);
        countedProjects.add(s.projectId);
      } else {
        amount = 0;
      }
    }
    return {
      session_id: s.id,
      date: s.ts,
      description: s.name + (project ? ` [${project.name}]` : ""),
      notes: s.notes || "",
      hours: billingType === "hourly" ? parseFloat((s.duration / 3600).toFixed(2)) : null,
      rate: billingType === "hourly" ? s.rate : null,
      billing_type: billingType,
      amount,
    };
  });

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const taxRateNum = parseFloat(taxRate || 0);
  const taxAmount = Number.isFinite(taxRateNum) ? (subtotal * taxRateNum) / 100 : 0;
  const total = subtotal + taxAmount;

  function toggleSession(id) {
    setSelectedSessionIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selectedSessionIds.size === clientSessions.length) {
      setSelectedSessionIds(new Set());
    } else {
      setSelectedSessionIds(new Set(clientSessions.map((s) => s.id)));
    }
  }

  async function handleSave() {
    if (!selectedClient) return;
    setSaving(true);
    setError("");
    const invoiceData = {
      client_id: selectedClientId,
      client_name: selectedClient.name,
      invoice_number: invoiceNumber,
      issue_date: issueDate,
      due_date: dueDate || null,
      currency,
      items,
      subtotal: parseFloat(subtotal.toFixed(2)),
      tax_rate: parseFloat(taxRateNum.toFixed(2)),
      tax_amount: parseFloat(taxAmount.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
      status: "draft",
      notes: invoiceNotes.trim() || null,
      session_ids: Array.from(selectedSessionIds),
    };
    const { error: err } = await onSave(invoiceData);
    setSaving(false);
    if (err) {
      setError(err.message);
      return;
    }
    onClose();
  }

  const labelStyle = {
    fontSize: 9,
    color: theme.muted,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    marginBottom: 4,
    display: "block",
  };

  const inputStyle = {
    width: "100%",
    background: "transparent",
    border: `1px solid ${theme.border}`,
    color: theme.text,
    fontFamily: "inherit",
    fontSize: 13,
    padding: "8px 10px",
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: theme.bg,
          border: `1px solid ${theme.border}`,
          padding: 28,
          width: "100%",
          maxWidth: 600,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 9, color: theme.muted, letterSpacing: "0.2em" }}>
              {t("invoices.new")} — {t(`invoices.step.${STEPS[step]}`)}
            </div>
            <div style={{ fontSize: 11, color: theme.muted, marginTop: 4 }}>
              {STEPS.map((s, i) => (
                <span key={s} style={{ marginRight: 8, color: i === step ? theme.text : theme.muted }}>
                  {i + 1}. {t(`invoices.step.${s}`)}
                </span>
              ))}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: theme.muted, cursor: "pointer", fontSize: 16 }}
          >
            ×
          </button>
        </div>

        {/* Step 0: Select client */}
        {step === 0 && (
          <div>
            <label style={labelStyle}>{t("invoices.selectClient")}</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {clients.map((client) => {
                const unpaidCount = sessions.filter(
                  (s) => s.clientId === client.id && s.status === "DONE" && (s.paymentStatus || "UNPAID") === "UNPAID"
                ).length;
                return (
                  <button
                    key={client.id}
                    onClick={() => setSelectedClientId(client.id)}
                    style={{
                      padding: "12px 14px",
                      background: selectedClientId === client.id ? theme.tabActiveBg : "transparent",
                      border: `1px solid ${selectedClientId === client.id ? theme.tabActive : theme.border}`,
                      color: selectedClientId === client.id ? theme.tabActive : theme.text,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      fontSize: 13,
                      textAlign: "left",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>{client.name}</span>
                    <span style={{ fontSize: 11, color: theme.muted }}>{unpaidCount} unpaid sessions</span>
                  </button>
                );
              })}
            </div>
            <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
              <button
                disabled={!selectedClientId}
                onClick={() => setStep(1)}
                style={{
                  padding: "10px 24px",
                  background: selectedClientId ? theme.tabActiveBg : "transparent",
                  border: `1px solid ${selectedClientId ? theme.tabActive : theme.border}`,
                  color: selectedClientId ? theme.tabActive : theme.muted,
                  cursor: selectedClientId ? "pointer" : "not-allowed",
                  fontFamily: "inherit",
                  fontSize: 11,
                  letterSpacing: "0.15em",
                }}
              >
                {t("invoices.next")} →
              </button>
            </div>
          </div>
        )}

        {/* Step 1: Pick sessions */}
        {step === 1 && (
          <div>
            {clientSessions.length === 0 ? (
              <div style={{ color: theme.muted, fontSize: 13, marginBottom: 20 }}>
                {t("invoices.noUnpaidSessions")}
              </div>
            ) : (
              <>
                <div style={{ marginBottom: 10 }}>
                  <button
                    onClick={toggleAll}
                    style={{
                      background: "none",
                      border: "none",
                      color: theme.muted,
                      cursor: "pointer",
                      fontSize: 11,
                      fontFamily: "inherit",
                      letterSpacing: "0.1em",
                      padding: 0,
                    }}
                  >
                    {selectedSessionIds.size === clientSessions.length ? t("invoices.deselectAll") : t("invoices.selectAll")}
                  </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 300, overflowY: "auto" }}>
                  {clientSessions.map((s) => {
                    const billingType = s.billingType || "hourly";
                    const amount =
                      billingType === "fixed_project" ? parseFloat(s.fixedAmount || 0) : parseFloat(s.earned || 0);
                    return (
                      <label
                        key={s.id}
                        style={{
                          display: "flex",
                          gap: 10,
                          padding: "10px 12px",
                          background: selectedSessionIds.has(s.id) ? theme.tabActiveBg : theme.statBg,
                          border: `1px solid ${selectedSessionIds.has(s.id) ? theme.tabActive : theme.border}`,
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedSessionIds.has(s.id)}
                          onChange={() => toggleSession(s.id)}
                          style={{ marginTop: 2 }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, color: theme.text }}>{s.name}</div>
                          <div style={{ fontSize: 11, color: theme.muted }}>
                            {formatDate(s.ts)} · {(s.duration / 3600).toFixed(2)}h · {formatMoney(amount, currency)}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
                <div style={{ marginTop: 12, fontSize: 12, color: theme.muted, textAlign: "right" }}>
                  {selectedSessionIds.size} {t("invoices.sessionsSelected")} ·{" "}
                  {formatMoney(
                    selectedSessions.reduce((sum, s) => {
                      const bt = s.billingType || "hourly";
                      return sum + (bt === "fixed_project" ? parseFloat(s.fixedAmount || 0) : parseFloat(s.earned || 0));
                    }, 0),
                    currency
                  )}
                </div>
              </>
            )}
            <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
              <button
                onClick={() => setStep(0)}
                style={{
                  padding: "10px 20px",
                  background: "none",
                  border: `1px solid ${theme.border}`,
                  color: theme.muted,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: 11,
                  letterSpacing: "0.15em",
                }}
              >
                ← {t("invoices.back")}
              </button>
              <button
                disabled={selectedSessionIds.size === 0}
                onClick={() => setStep(2)}
                style={{
                  padding: "10px 24px",
                  background: selectedSessionIds.size > 0 ? theme.tabActiveBg : "transparent",
                  border: `1px solid ${selectedSessionIds.size > 0 ? theme.tabActive : theme.border}`,
                  color: selectedSessionIds.size > 0 ? theme.tabActive : theme.muted,
                  cursor: selectedSessionIds.size > 0 ? "pointer" : "not-allowed",
                  fontFamily: "inherit",
                  fontSize: 11,
                  letterSpacing: "0.15em",
                }}
              >
                {t("invoices.next")} →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Invoice details */}
        {step === 2 && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              <div>
                <label style={labelStyle}>{t("invoices.invoiceNumber")}</label>
                <input
                  style={inputStyle}
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                />
              </div>
              <div>
                <label style={labelStyle}>{t("invoices.taxRate")} (%)</label>
                <input
                  style={inputStyle}
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                />
              </div>
              <div>
                <label style={labelStyle}>{t("invoices.issueDate")}</label>
                <input
                  style={inputStyle}
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                />
              </div>
              <div>
                <label style={labelStyle}>{t("invoices.dueDate")}</label>
                <input
                  style={inputStyle}
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>{t("crm.notes")}</label>
              <textarea
                style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
                value={invoiceNotes}
                onChange={(e) => setInvoiceNotes(e.target.value)}
                placeholder={t("invoices.notesPlaceholder")}
              />
            </div>
            <div style={{ marginBottom: 14, background: theme.statBg, border: `1px solid ${theme.border}`, padding: "12px 14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: theme.muted }}>{t("invoices.subtotal")}</span>
                <span style={{ fontSize: 13 }}>{formatMoney(subtotal, currency)}</span>
              </div>
              {taxRateNum > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: theme.muted }}>{t("invoices.tax")} ({taxRateNum}%)</span>
                  <span style={{ fontSize: 13 }}>{formatMoney(taxAmount, currency)}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", borderTop: `1px solid ${theme.border}`, paddingTop: 8 }}>
                <span style={{ fontSize: 11, color: theme.muted }}>{t("invoices.total")}</span>
                <span style={{ fontSize: 16, fontWeight: 500 }}>{formatMoney(total, currency)}</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setStep(1)}
                style={{
                  padding: "10px 20px",
                  background: "none",
                  border: `1px solid ${theme.border}`,
                  color: theme.muted,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: 11,
                  letterSpacing: "0.15em",
                }}
              >
                ← {t("invoices.back")}
              </button>
              <button
                onClick={() => setStep(3)}
                style={{
                  padding: "10px 24px",
                  background: theme.tabActiveBg,
                  border: `1px solid ${theme.tabActive}`,
                  color: theme.tabActive,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: 11,
                  letterSpacing: "0.15em",
                }}
              >
                {t("invoices.preview")} →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Preview */}
        {step === 3 && (
          <div>
            <div style={{ background: theme.statBg, border: `1px solid ${theme.border}`, padding: 16, marginBottom: 20 }}>
              <div style={{ marginBottom: 12, display: "flex", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 9, color: theme.muted, letterSpacing: "0.2em" }}>INVOICE</div>
                  <div style={{ fontSize: 20, color: theme.text }}>{invoiceNumber}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 12, color: theme.muted }}>{issueDate}</div>
                  <div style={{ fontSize: 12, color: theme.text, marginTop: 2 }}>{selectedClient?.name}</div>
                </div>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr>
                    {["Description", "Hours", "Amount"].map((h) => (
                      <th key={h} style={{ textAlign: "left", fontSize: 9, color: theme.muted, letterSpacing: "0.15em", paddingBottom: 6, borderBottom: `1px solid ${theme.border}` }}>
                        {h.toUpperCase()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={i}>
                      <td style={{ padding: "8px 0", borderBottom: `1px solid ${theme.border}`, color: theme.text }}>{item.description}</td>
                      <td style={{ padding: "8px 0", borderBottom: `1px solid ${theme.border}`, color: theme.muted }}>{item.hours != null ? `${item.hours}h` : "—"}</td>
                      <td style={{ padding: "8px 0", borderBottom: `1px solid ${theme.border}`, color: theme.text, textAlign: "right" }}>{formatMoney(item.amount, currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ textAlign: "right", marginTop: 12 }}>
                <div style={{ fontSize: 11, color: theme.muted }}>TOTAL DUE</div>
                <div style={{ fontSize: 20 }}>{formatMoney(total, currency)}</div>
              </div>
            </div>

            {error && <div style={{ color: "#cc2222", fontSize: 12, marginBottom: 12 }}>{error}</div>}

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setStep(2)}
                style={{
                  padding: "10px 20px",
                  background: "none",
                  border: `1px solid ${theme.border}`,
                  color: theme.muted,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: 11,
                  letterSpacing: "0.15em",
                }}
              >
                ← {t("invoices.back")}
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding: "10px 24px",
                  background: theme.tabActiveBg,
                  border: `1px solid ${theme.tabActive}`,
                  color: theme.tabActive,
                  cursor: saving ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  fontSize: 11,
                  letterSpacing: "0.15em",
                }}
              >
                {saving ? t("crm.saving") : t("invoices.save")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
