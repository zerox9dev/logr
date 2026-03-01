import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { formatMoney } from "../lib/utils";
import { upsertClientProfile } from "../lib/crm";
import InvoiceBuilder from "./InvoiceBuilder";

function summarizeClient(sessions, clientId) {
  const doneSessions = sessions.filter((session) => session.clientId === clientId && session.status === "DONE");
  const totalHours = doneSessions.reduce((sum, session) => sum + (session.duration || 0), 0) / 3600;
  const totalEarned = doneSessions.reduce((sum, session) => {
    if (session.billingType === "fixed_project") return sum + parseFloat(session.fixedAmount || 0);
    return sum + parseFloat(session.earned || 0);
  }, 0);
  const paidTotal = doneSessions.reduce((sum, session) => {
    if (session.paymentStatus !== "PAID") return sum;
    if (session.billingType === "fixed_project") return sum + parseFloat(session.fixedAmount || 0);
    return sum + parseFloat(session.earned || 0);
  }, 0);
  return {
    doneCount: doneSessions.length,
    totalHours,
    totalEarned,
    unpaidTotal: totalEarned - paidTotal,
  };
}

function ActionIcon({ name, color }) {
  const common = {
    width: 14,
    height: 14,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };
  if (name === "edit") {
    return (
      <svg {...common}>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
      </svg>
    );
  }
  if (name === "invoice") {
    return (
      <svg {...common}>
        <path d="M7 3h8l4 4v14H7z" />
        <path d="M15 3v5h5" />
        <path d="M10 12h6" />
        <path d="M10 16h6" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
      <path d="M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

export default function ClientsManager({
  theme,
  clients,
  sessions,
  clientProfiles,
  activeClient,
  user,
  currency,
  onCreateClient,
  onSelectClient,
  onRenameClient,
  onRemoveClient,
  invoices,
  onCreateInvoice,
  onProfileSaved,
}) {
  const { t } = useTranslation();
  const [modalMode, setModalMode] = useState("closed");
  const [modalClient, setModalClient] = useState(null);
  const [modalName, setModalName] = useState("");
  const [modalEmail, setModalEmail] = useState("");
  const [modalPhone, setModalPhone] = useState("");
  const [modalWebsite, setModalWebsite] = useState("");
  const [modalCountry, setModalCountry] = useState("");
  const [modalTags, setModalTags] = useState("");
  const [modalNotes, setModalNotes] = useState("");
  const [modalSaving, setModalSaving] = useState(false);
  const [modalError, setModalError] = useState("");
  const [invoiceClientId, setInvoiceClientId] = useState("");

  const profileByClientId = useMemo(() => {
    return (clientProfiles || []).reduce((map, profile) => {
      map[profile.client_id] = profile;
      return map;
    }, {});
  }, [clientProfiles]);

  const cardStyle = {
    background: theme.statBg,
    border: `1px solid ${theme.border}`,
    borderRadius: 6,
    padding: 14,
  };

  function openCreateModal() {
    setModalMode("create");
    setModalClient(null);
    setModalName("");
    setModalEmail("");
    setModalPhone("");
    setModalWebsite("");
    setModalCountry("");
    setModalTags("");
    setModalNotes("");
    setModalSaving(false);
    setModalError("");
  }

  function openEditModal(client) {
    setModalMode("edit");
    const profile = profileByClientId[client.id] || {};
    setModalClient(client);
    setModalName(client.name || "");
    setModalEmail(profile.email || "");
    setModalPhone(profile.phone || "");
    setModalWebsite(profile.website || "");
    setModalCountry(profile.country || "");
    setModalTags((profile.tags || []).join(", "));
    setModalNotes(profile.notes || "");
    setModalSaving(false);
    setModalError("");
  }

  function closeEditModal() {
    if (modalSaving) return;
    setModalMode("closed");
    setModalClient(null);
    setModalError("");
  }

  async function saveEditModal() {
    if (modalSaving) return;
    const trimmedName = modalName.trim();
    if (!trimmedName) {
      setModalError(t("crm.nameRequired"));
      return;
    }

    setModalSaving(true);
    setModalError("");

    let targetClientId = modalClient?.id || null;
    if (modalMode === "create") {
      const createdClientId = onCreateClient(trimmedName);
      if (!createdClientId) {
        setModalSaving(false);
        setModalError(t("crm.nameRequired"));
        return;
      }
      targetClientId = createdClientId;
      onSelectClient(createdClientId);
    } else if (modalClient) {
      onRenameClient(modalClient.id, trimmedName);
    }

    if (user) {
      const tags = modalTags.split(",").map((item) => item.trim()).filter(Boolean);
      const { data, error } = await upsertClientProfile(user.id, targetClientId, {
        email: modalEmail.trim() || null,
        phone: modalPhone.trim() || null,
        website: modalWebsite.trim() || null,
        country: modalCountry.trim() || null,
        tags,
        notes: modalNotes.trim() || null,
      });
      if (error) {
        setModalSaving(false);
        setModalError(error.message);
        return;
      }
      if (onProfileSaved) onProfileSaved(data);
    }

    setModalSaving(false);
    closeEditModal();
  }

  function removeClient(clientId) {
    if (!window.confirm(t("crm.confirmDeleteClient"))) return;
    onRemoveClient(clientId);
  }

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 9, color: theme.muted, letterSpacing: "0.2em", marginBottom: 4 }}>{t("sidebar.clients")}</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 10, flexWrap: "wrap" }}>
          <h2 style={{ fontSize: 28, fontWeight: 400, letterSpacing: "-0.02em" }}>{t("crm.clientsDirectory")}</h2>
          <button
            data-tour="add-client-btn"
            onClick={openCreateModal}
            style={{
              padding: "8px 12px",
              background: "transparent",
              border: `1px solid ${theme.border}`,
              color: theme.text,
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 10,
              letterSpacing: "0.1em",
            }}
          >
            {t("crm.addClient")}
          </button>
        </div>
        <div style={{ color: theme.muted, fontSize: 12 }}>{t("crm.clientsDirectoryHint")}</div>
      </div>

      {clients.length === 0 ? (
        <div style={{ ...cardStyle, color: theme.muted, fontSize: 13 }}>{t("crm.noClients")}</div>
      ) : (
        <div style={{ ...cardStyle, marginBottom: 22, overflowX: "auto", padding: 0 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 980 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${theme.border}`, background: theme.faint }}>
                {[t("sidebar.clients"), t("crm.email"), t("crm.phone"), t("crm.country"), t("crm.projectsCount"), t("crm.doneSessions"), t("crm.totalEarned"), t("crm.unpaid"), t("crm.actions")].map((header) => (
                  <th
                    key={header}
                    style={{
                      textAlign: "left",
                      fontSize: 10,
                      letterSpacing: "0.12em",
                      color: theme.muted,
                      fontWeight: 500,
                      padding: "10px 12px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => {
                const profile = profileByClientId[client.id] || null;
                const stats = summarizeClient(sessions, client.id);
                const isActive = activeClient?.id === client.id;
                return (
                  <tr key={client.id} style={{ borderBottom: `1px solid ${theme.border}`, background: isActive ? theme.tabActiveBg : "transparent" }}>
                    <td style={{ padding: "10px 12px", fontSize: 13, fontWeight: 500, whiteSpace: "nowrap" }}>
                      <button
                        onClick={() => {
                          onSelectClient(client.id);
                          openEditModal(client);
                        }}
                        style={{
                          background: "transparent",
                          border: "none",
                          padding: 0,
                          margin: 0,
                          color: theme.text,
                          cursor: "pointer",
                          fontFamily: "inherit",
                          fontSize: 13,
                          textDecoration: "underline",
                          textUnderlineOffset: 3,
                        }}
                      >
                        {client.name}
                      </button>
                    </td>
                    <td style={{ padding: "10px 12px", fontSize: 12, color: theme.muted, whiteSpace: "nowrap" }}>{profile?.email || "—"}</td>
                    <td style={{ padding: "10px 12px", fontSize: 12, color: theme.muted, whiteSpace: "nowrap" }}>{profile?.phone || "—"}</td>
                    <td style={{ padding: "10px 12px", fontSize: 12, color: theme.muted, whiteSpace: "nowrap" }}>{profile?.country || "—"}</td>
                    <td style={{ padding: "10px 12px", fontSize: 12 }}>{(client.projects || []).length}</td>
                    <td style={{ padding: "10px 12px", fontSize: 12 }}>{stats.doneCount}</td>
                    <td style={{ padding: "10px 12px", fontSize: 12, whiteSpace: "nowrap" }}>{formatMoney(stats.totalEarned, currency)}</td>
                    <td style={{ padding: "10px 12px", fontSize: 12, whiteSpace: "nowrap" }}>{formatMoney(stats.unpaidTotal, currency)}</td>
                    <td style={{ padding: "10px 12px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={() => setInvoiceClientId(client.id)}
                          style={{
                            width: 28,
                            height: 28,
                            display: "inline-grid",
                            placeItems: "center",
                            background: "transparent",
                            border: `1px solid ${theme.border}`,
                            color: theme.text,
                            cursor: "pointer",
                            padding: 0,
                          }}
                          aria-label={t("crm.createInvoice")}
                          title={t("crm.createInvoice")}
                        >
                          <ActionIcon name="invoice" color={theme.text} />
                        </button>
                        <button
                          onClick={() => openEditModal(client)}
                          style={{
                            width: 28,
                            height: 28,
                            display: "inline-grid",
                            placeItems: "center",
                            background: "transparent",
                            border: `1px solid ${theme.border}`,
                            color: theme.text,
                            cursor: "pointer",
                            padding: 0,
                          }}
                          aria-label={t("crm.editClient")}
                          title={t("crm.editClient")}
                        >
                          <ActionIcon name="edit" color={theme.text} />
                        </button>
                        <button
                          onClick={() => removeClient(client.id)}
                          style={{
                            width: 28,
                            height: 28,
                            display: "inline-grid",
                            placeItems: "center",
                            background: "transparent",
                            border: "1px solid #cc6b6b",
                            color: "#b44444",
                            cursor: "pointer",
                            padding: 0,
                          }}
                          aria-label={t("crm.deleteClient")}
                          title={t("crm.deleteClient")}
                        >
                          <ActionIcon name="delete" color="#b44444" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {modalMode !== "closed" ? (
        <div
          onClick={closeEditModal}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            zIndex: 120,
            display: "grid",
            placeItems: "center",
            padding: 16,
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "min(720px, 100%)",
              maxHeight: "90vh",
              overflowY: "auto",
              background: theme.bg,
              border: `1px solid ${theme.border}`,
              borderRadius: 8,
              padding: 18,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontSize: 10, color: theme.muted, letterSpacing: "0.14em" }}>
                {modalMode === "create" ? t("crm.addClient") : t("crm.editClientModalTitle")}
              </div>
              <button
                onClick={closeEditModal}
                style={{
                  border: `1px solid ${theme.border}`,
                  background: "transparent",
                  color: theme.text,
                  padding: "6px 10px",
                  cursor: modalSaving ? "not-allowed" : "pointer",
                  fontSize: 10,
                  letterSpacing: "0.1em",
                }}
              >
                {t("crm.close")}
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <input
                value={modalName}
                onChange={(event) => setModalName(event.target.value)}
                placeholder={t("crm.clientNameLabel")}
                style={{ background: theme.faint, border: `1px solid ${theme.border}`, padding: "10px 12px", fontSize: 13, fontFamily: "inherit", color: theme.text }}
              />
              <input
                type="email"
                value={modalEmail}
                onChange={(event) => setModalEmail(event.target.value)}
                placeholder={t("crm.email")}
                style={{ background: theme.faint, border: `1px solid ${theme.border}`, padding: "10px 12px", fontSize: 13, fontFamily: "inherit", color: theme.text }}
              />
              <input
                type="tel"
                value={modalPhone}
                onChange={(event) => setModalPhone(event.target.value)}
                placeholder={t("crm.phone")}
                style={{ background: theme.faint, border: `1px solid ${theme.border}`, padding: "10px 12px", fontSize: 13, fontFamily: "inherit", color: theme.text }}
              />
              <input
                type="url"
                value={modalWebsite}
                onChange={(event) => setModalWebsite(event.target.value)}
                placeholder={t("crm.website")}
                style={{ background: theme.faint, border: `1px solid ${theme.border}`, padding: "10px 12px", fontSize: 13, fontFamily: "inherit", color: theme.text }}
              />
              <input
                value={modalCountry}
                onChange={(event) => setModalCountry(event.target.value)}
                placeholder={t("crm.country")}
                style={{ background: theme.faint, border: `1px solid ${theme.border}`, padding: "10px 12px", fontSize: 13, fontFamily: "inherit", color: theme.text }}
              />
              <input
                value={modalTags}
                onChange={(event) => setModalTags(event.target.value)}
                placeholder={t("crm.tags")}
                style={{ background: theme.faint, border: `1px solid ${theme.border}`, padding: "10px 12px", fontSize: 13, fontFamily: "inherit", color: theme.text }}
              />
            </div>

            <textarea
              value={modalNotes}
              onChange={(event) => setModalNotes(event.target.value)}
              placeholder={t("crm.notes")}
              style={{
                marginTop: 12,
                width: "100%",
                minHeight: 120,
                background: theme.faint,
                border: `1px solid ${theme.border}`,
                padding: "10px 12px",
                fontSize: 13,
                fontFamily: "inherit",
                color: theme.text,
                resize: "vertical",
              }}
            />

            {modalError ? <div style={{ marginTop: 10, color: "#b44444", fontSize: 12 }}>{modalError}</div> : null}

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
              <button
                onClick={saveEditModal}
                disabled={modalSaving}
                style={{
                  padding: "10px 14px",
                  border: `1px solid ${theme.tabActive}`,
                  background: theme.tabActiveBg,
                  color: theme.tabActive,
                  fontSize: 11,
                  letterSpacing: "0.1em",
                  cursor: modalSaving ? "not-allowed" : "pointer",
                }}
              >
                {modalSaving ? t("crm.saving") : modalMode === "create" ? t("crm.addClient") : t("crm.saveChanges")}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {invoiceClientId ? (
        <InvoiceBuilder
          theme={theme}
          clients={clients}
          sessions={sessions}
          invoices={invoices}
          currency={currency}
          initialClientId={invoiceClientId}
          onSave={onCreateInvoice}
          onClose={() => setInvoiceClientId("")}
        />
      ) : null}
    </div>
  );
}
