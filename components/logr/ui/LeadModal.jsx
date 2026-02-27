import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

const STAGES = ["lead", "negotiation", "contract", "active", "done"];

export default function LeadModal({ theme, lead, defaultStage, onSave, onClose }) {
  const { t } = useTranslation();

  const [name, setName] = useState(lead?.name || "");
  const [company, setCompany] = useState(lead?.company || "");
  const [email, setEmail] = useState(lead?.email || "");
  const [phone, setPhone] = useState(lead?.phone || "");
  const [website, setWebsite] = useState(lead?.website || "");
  const [country, setCountry] = useState(lead?.country || "");
  const [stage, setStage] = useState(lead?.stage || defaultStage || "lead");
  const [estimatedValue, setEstimatedValue] = useState(lead?.estimated_value != null ? String(lead.estimated_value) : "");
  const [currency, setCurrency] = useState(lead?.currency || "USD");
  const [source, setSource] = useState(lead?.source || "");
  const [tagsInput, setTagsInput] = useState((lead?.tags || []).join(", "));
  const [notes, setNotes] = useState(lead?.notes || "");
  const [error, setError] = useState("");

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function handleSave() {
    if (!name.trim()) {
      setError(t("pipeline.nameRequired"));
      return;
    }
    const tags = tagsInput.split(",").map((t) => t.trim()).filter(Boolean);
    const parsed = parseFloat(estimatedValue);
    onSave({
      name: name.trim(),
      company: company.trim() || null,
      email: email.trim() || null,
      phone: phone.trim() || null,
      website: website.trim() || null,
      country: country.trim() || null,
      stage,
      estimated_value: Number.isFinite(parsed) && parsed > 0 ? parsed : null,
      currency,
      source: source.trim() || null,
      tags,
      notes: notes.trim() || null,
    });
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
        background: "rgba(0,0,0,0.55)",
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
          maxWidth: 540,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div style={{ marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 9, color: theme.muted, letterSpacing: "0.2em" }}>
            {lead ? t("pipeline.editLead") : t("pipeline.newLead")}
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: theme.muted, cursor: "pointer", fontSize: 16 }}
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>{t("pipeline.leadName")} *</label>
          <input
            autoFocus
            style={inputStyle}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
            placeholder="John Smith"
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
          <div>
            <label style={labelStyle}>{t("pipeline.company")}</label>
            <input style={inputStyle} value={company} onChange={(e) => setCompany(e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>{t("pipeline.stage")}</label>
            <select
              style={{ ...inputStyle, cursor: "pointer" }}
              value={stage}
              onChange={(e) => setStage(e.target.value)}
            >
              {STAGES.map((s) => (
                <option key={s} value={s}>{t(`pipeline.stages.${s}`)}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>{t("pipeline.estimatedValue")}</label>
            <input
              style={inputStyle}
              type="number"
              min="0"
              step="0.01"
              value={estimatedValue}
              onChange={(e) => setEstimatedValue(e.target.value)}
            />
          </div>
          <div>
            <label style={labelStyle}>{t("pipeline.currency")}</label>
            <select
              style={{ ...inputStyle, cursor: "pointer" }}
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              {["USD", "EUR", "PLN", "UAH"].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>{t("crm.email")}</label>
            <input style={inputStyle} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>{t("crm.phone")}</label>
            <input style={inputStyle} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>{t("crm.website")}</label>
            <input style={inputStyle} value={website} onChange={(e) => setWebsite(e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>{t("crm.country")}</label>
            <input style={inputStyle} value={country} onChange={(e) => setCountry(e.target.value)} />
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>{t("pipeline.source")}</label>
          <input style={inputStyle} value={source} onChange={(e) => setSource(e.target.value)} placeholder="Referral, LinkedIn, etc." />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>{t("crm.tags")}</label>
          <input
            style={inputStyle}
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="design, web, mobile"
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>{t("crm.notes")}</label>
          <textarea
            style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {error && <div style={{ color: "#cc2222", fontSize: 12, marginBottom: 12 }}>{error}</div>}

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={handleSave}
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
            {t("common.save")}
          </button>
          <button
            onClick={onClose}
            style={{
              padding: "10px 24px",
              background: "none",
              border: `1px solid ${theme.border}`,
              color: theme.muted,
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 11,
              letterSpacing: "0.15em",
            }}
          >
            {t("pipeline.cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}
