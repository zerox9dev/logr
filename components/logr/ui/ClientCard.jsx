import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { upsertClientProfile } from "../lib/crm";
import { formatMoney } from "../lib/utils";

export default function ClientCard({
  theme,
  client,
  clientProfile,
  sessions,
  user,
  currency,
  onProfileSaved,
}) {
  const { t } = useTranslation();

  const [email, setEmail] = useState(clientProfile?.email || "");
  const [phone, setPhone] = useState(clientProfile?.phone || "");
  const [website, setWebsite] = useState(clientProfile?.website || "");
  const [country, setCountry] = useState(clientProfile?.country || "");
  const [tagsInput, setTagsInput] = useState((clientProfile?.tags || []).join(", "));
  const [notes, setNotes] = useState(clientProfile?.notes || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setEmail(clientProfile?.email || "");
    setPhone(clientProfile?.phone || "");
    setWebsite(clientProfile?.website || "");
    setCountry(clientProfile?.country || "");
    setTagsInput((clientProfile?.tags || []).join(", "));
    setNotes(clientProfile?.notes || "");
  }, [client?.id, clientProfile]);

  const clientSessions = sessions.filter((s) => s.clientId === client?.id);
  const doneSessions = clientSessions.filter((s) => s.status === "DONE");
  const totalEarned = doneSessions.reduce((sum, s) => {
    if (s.billingType === "fixed_project") return sum + parseFloat(s.fixedAmount || 0);
    return sum + parseFloat(s.earned || 0);
  }, 0);
  const paidTotal = doneSessions.filter((s) => s.paymentStatus === "PAID").reduce((sum, s) => {
    if (s.billingType === "fixed_project") return sum + parseFloat(s.fixedAmount || 0);
    return sum + parseFloat(s.earned || 0);
  }, 0);
  const unpaidTotal = totalEarned - paidTotal;
  const totalHours = (doneSessions.reduce((sum, s) => sum + s.duration, 0) / 3600).toFixed(1);

  async function save() {
    if (!user || !client) return;
    setSaving(true);
    setError("");
    const tags = tagsInput.split(",").map((t) => t.trim()).filter(Boolean);
    const { data, error: err } = await upsertClientProfile(user.id, client.id, {
      email: email.trim() || null,
      phone: phone.trim() || null,
      website: website.trim() || null,
      country: country.trim() || null,
      tags,
      notes: notes.trim() || null,
    });
    setSaving(false);
    if (err) {
      setError(err.message);
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    if (onProfileSaved) onProfileSaved(data);
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

  const statBoxStyle = {
    background: theme.statBg,
    border: `1px solid ${theme.border}`,
    borderRadius: 4,
    padding: "12px 16px",
    flex: 1,
  };

  if (!client) return null;

  return (
    <div style={{ maxWidth: 720 }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 9, color: theme.muted, letterSpacing: "0.2em", marginBottom: 4 }}>
          {t("crm.clientCard")}
        </div>
        <h2 style={{ fontSize: 28, fontWeight: 400, letterSpacing: "-0.02em" }}>{client.name}</h2>
      </div>

      {/* Revenue summary */}
      <div style={{ display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap" }}>
        <div style={statBoxStyle}>
          <div style={labelStyle}>{t("crm.totalHours")}</div>
          <div style={{ fontSize: 20, fontWeight: 400 }}>{totalHours}h</div>
        </div>
        <div style={statBoxStyle}>
          <div style={labelStyle}>{t("crm.totalEarned")}</div>
          <div style={{ fontSize: 20, fontWeight: 400 }}>{formatMoney(totalEarned, currency)}</div>
        </div>
        <div style={statBoxStyle}>
          <div style={labelStyle}>{t("crm.unpaid")}</div>
          <div style={{ fontSize: 20, fontWeight: 400, color: unpaidTotal > 0 ? "#cc4444" : theme.text }}>
            {formatMoney(unpaidTotal, currency)}
          </div>
        </div>
        <div style={statBoxStyle}>
          <div style={labelStyle}>{t("crm.paid")}</div>
          <div style={{ fontSize: 20, fontWeight: 400 }}>{formatMoney(paidTotal, currency)}</div>
        </div>
      </div>

      {/* CRM fields */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div>
          <label style={labelStyle}>{t("crm.email")}</label>
          <input
            style={inputStyle}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="client@example.com"
          />
        </div>
        <div>
          <label style={labelStyle}>{t("crm.phone")}</label>
          <input
            style={inputStyle}
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 555 000 0000"
          />
        </div>
        <div>
          <label style={labelStyle}>{t("crm.website")}</label>
          <input
            style={inputStyle}
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://example.com"
          />
        </div>
        <div>
          <label style={labelStyle}>{t("crm.country")}</label>
          <input
            style={inputStyle}
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="United States"
          />
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>{t("crm.tags")}</label>
        <input
          style={inputStyle}
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="design, web, retainer"
        />
        <div style={{ fontSize: 10, color: theme.muted, marginTop: 4 }}>{t("crm.tagsHint")}</div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>{t("crm.notes")}</label>
        <textarea
          style={{ ...inputStyle, minHeight: 100, resize: "vertical" }}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t("crm.notesPlaceholder")}
        />
      </div>

      {error && <div style={{ marginBottom: 12, color: "#cc2222", fontSize: 12 }}>{error}</div>}

      <button
        onClick={save}
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
        {saving ? t("crm.saving") : saved ? t("crm.saved") : t("common.save")}
      </button>
    </div>
  );
}
