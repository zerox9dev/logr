import { useState } from "react";
import { useTranslation } from "react-i18next";

function MenuIcon({ name, color }) {
  const common = { width: 14, height: 14, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };
  if (name === "dashboard") {
    return (
      <svg {...common}>
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="5" />
        <rect x="14" y="11" width="7" height="10" />
        <rect x="3" y="13" width="7" height="8" />
      </svg>
    );
  }
  if (name === "tracker") {
    return (
      <svg {...common}>
        <circle cx="12" cy="13" r="8" />
        <path d="M12 13V8" />
        <path d="M12 13L16 15" />
      </svg>
    );
  }
  if (name === "pipeline") {
    return (
      <svg {...common}>
        <rect x="3" y="6" width="5" height="12" />
        <rect x="10" y="9" width="5" height="9" />
        <rect x="17" y="12" width="4" height="6" />
      </svg>
    );
  }
  if (name === "invoices") {
    return (
      <svg {...common}>
        <path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" />
        <path d="M9 8h6" />
        <path d="M9 12h6" />
        <path d="M9 16h4" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </svg>
  );
}

export default function Sidebar({
  theme,
  dark,
  screen,
  clients,
  activeClientId,
  mobileView,
  showAddClient,
  newClientName,
  setNewClientName,
  setShowAddClient,
  onAddClient,
  onSelectClient,
  onRemoveClient,
  onRenameClient,
  onSelectScreen,
  onToggleTheme,
  onOpenOnboarding,
}) {
  const { t } = useTranslation();
  const [editClientId, setEditClientId] = useState(null);
  const [editClientName, setEditClientName] = useState("");

  const inputStyle = {
    background: "transparent",
    border: "none",
    outline: "none",
    fontFamily: "inherit",
    color: theme.inputColor,
  };

  function startRename(client) {
    setEditClientId(client.id);
    setEditClientName(client.name);
  }

  function cancelRename() {
    setEditClientId(null);
    setEditClientName("");
  }

  function submitRename(clientId) {
    onRenameClient(clientId, editClientName);
    cancelRename();
  }

  const showClientList = screen === "tracker" || screen === "clients";

  return (
    <div
      className={`sidebar${mobileView === "clients" ? " mobile-open" : ""}`}
      style={{
        width: 200,
        borderRight: `1px solid ${theme.border}`,
        padding: "32px 0",
        flexShrink: 0,
        flexDirection: "column",
        background: theme.bg,
        height: "100vh",
        position: "sticky",
        top: 0,
      }}
    >
      <div style={{ fontSize: 9, color: theme.muted, letterSpacing: "0.2em", padding: "0 20px", marginBottom: 8 }}>{t("sidebar.app")}</div>
      <div style={{ display: "grid", gap: 4, padding: "0 20px", marginBottom: 18 }}>
        {[
          ["dashboard", t("sidebar.dashboard")],
          ["tracker", t("sidebar.tracker")],
          ["pipeline", t("sidebar.pipeline")],
          ["invoices", t("sidebar.invoices")],
        ].map(([value, label]) => (
          <button
            key={value}
            data-tour={value === "tracker" ? "tracker-tab" : undefined}
            onClick={() => onSelectScreen(value)}
            style={{
              padding: "6px 10px",
              background: screen === value ? theme.tabActiveBg : "transparent",
              border: `1px solid ${theme.border}`,
              color: screen === value ? theme.tabActive : theme.tabInactive,
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 10,
              letterSpacing: "0.12em",
              textAlign: "left",
            }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <span aria-hidden style={{ width: 14, height: 14, display: "inline-grid", placeItems: "center" }}>
                <MenuIcon name={value} color={screen === value ? theme.tabActive : theme.tabInactive} />
              </span>
              <span>{label}</span>
            </span>
          </button>
        ))}
      </div>

      {showClientList ? (
        <>
          <div style={{ fontSize: 9, color: theme.muted, letterSpacing: "0.2em", padding: "0 20px", marginBottom: 16 }}>{t("sidebar.clients")}</div>

          {clients.map((client) => (
            <div
              key={client.id}
              className="row"
              style={{
                display: "flex",
                alignItems: "center",
                padding: "8px 20px",
                cursor: "pointer",
                background: client.id === activeClientId ? theme.tabActiveBg : "transparent",
                borderLeft: client.id === activeClientId ? `2px solid ${theme.tabActive}` : "2px solid transparent",
              }}
              onClick={() => onSelectClient(client.id)}
            >
              {editClientId === client.id ? (
                <input
                  autoFocus
                  value={editClientName}
                  onChange={(event) => setEditClientName(event.target.value)}
                  onClick={(event) => event.stopPropagation()}
                  onBlur={() => submitRename(client.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") submitRename(client.id);
                    if (event.key === "Escape") {
                      event.stopPropagation();
                      cancelRename();
                    }
                  }}
                  style={{
                    ...inputStyle,
                    flex: 1,
                    fontSize: 12,
                    color: client.id === activeClientId ? theme.tabActive : theme.tabInactive,
                    borderBottom: `1px solid ${theme.border}`,
                    paddingBottom: 2,
                  }}
                />
              ) : (
                <div
                  onDoubleClick={(event) => {
                    event.stopPropagation();
                    startRename(client);
                  }}
                  style={{
                    flex: 1,
                    fontSize: 12,
                    color: client.id === activeClientId ? theme.tabActive : theme.tabInactive,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {client.name}
                </div>
              )}
              <button
                className="del"
                onClick={(event) => {
                  event.stopPropagation();
                  startRename(client);
                }}
                style={{ opacity: 0, background: "none", border: "none", color: theme.muted, cursor: "pointer", fontSize: 12, transition: "opacity 0.15s", padding: "0 2px" }}
                aria-label={t("sidebar.editClientName")}
                title={t("sidebar.editClientName")}
              >
                ✎
              </button>
              <button
                className="del"
                onClick={(event) => {
                  event.stopPropagation();
                  onRemoveClient(client.id);
                }}
                style={{ opacity: 0, background: "none", border: "none", color: theme.muted, cursor: "pointer", fontSize: 14, transition: "opacity 0.15s", padding: "0 2px" }}
              >
                ×
              </button>
            </div>
          ))}

          {showAddClient ? (
            <div style={{ padding: "8px 20px" }}>
              <input
                autoFocus
                value={newClientName}
                onChange={(event) => setNewClientName(event.target.value)}
                placeholder={t("sidebar.clientName")}
                onKeyDown={(event) => {
                  if (event.key === "Enter") onAddClient();
                  if (event.key === "Escape") setShowAddClient(false);
                }}
                style={{ ...inputStyle, width: "100%", fontSize: 12, borderBottom: `1px solid ${theme.border}`, paddingBottom: 4 }}
              />
            </div>
          ) : (
            <button
              data-tour="add-client-btn"
              onClick={() => setShowAddClient(true)}
              style={{ margin: "8px 20px 0", padding: "6px 0", background: "none", border: `1px dashed ${theme.border}`, color: theme.muted, cursor: "pointer", fontFamily: "inherit", fontSize: 11, letterSpacing: "0.1em" }}
            >
              {t("sidebar.addClient")}
            </button>
          )}
        </>
      ) : null}

      <div style={{ marginTop: "auto", padding: "0 20px" }}>
        <button
          onClick={() => onSelectScreen("profile")}
          style={{ width: "100%", marginBottom: 10, background: screen === "profile" ? theme.tabActiveBg : "none", border: `1px solid ${theme.border}`, color: screen === "profile" ? theme.tabActive : theme.muted, cursor: "pointer", padding: "6px 10px", fontSize: 10, fontFamily: "inherit", letterSpacing: "0.1em" }}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <span aria-hidden style={{ width: 14, height: 14, display: "inline-grid", placeItems: "center" }}>
              <MenuIcon name="profile" color={screen === "profile" ? theme.tabActive : theme.muted} />
            </span>
            <span>{t("sidebar.profile")}</span>
          </span>
        </button>
        <button
          onClick={onToggleTheme}
          style={{ background: "none", border: `1px solid ${theme.border}`, color: theme.muted, cursor: "pointer", padding: "6px 10px", fontSize: 10, fontFamily: "inherit", letterSpacing: "0.1em", width: "100%" }}
        >
          {dark ? t("sidebar.light") : t("sidebar.dark")}
        </button>
        <button
          onClick={onOpenOnboarding}
          style={{ width: "100%", marginTop: 10, background: "none", border: `1px solid ${theme.border}`, color: theme.muted, cursor: "pointer", padding: "6px 10px", fontSize: 10, fontFamily: "inherit", letterSpacing: "0.1em" }}
        >
          {t("sidebar.onboarding")}
        </button>
        <div
          style={{
            marginTop: 10,
            fontSize: 10,
            color: theme.muted,
            letterSpacing: "0.08em",
            textAlign: "center",
          }}
        >
          {t("sidebar.madeBy")}{" "}
          <a href="https://zerox9dev.com" target="_blank" rel="noreferrer" style={{ color: theme.muted, textDecoration: "underline" }}>
            zerox9dev
          </a>
        </div>
        <div
          style={{
            marginTop: 6,
            fontSize: 10,
            color: theme.muted,
            letterSpacing: "0.08em",
            textAlign: "center",
          }}
        >
          <a href="https://github.com/zerox9dev/logr" target="_blank" rel="noreferrer" style={{ color: theme.muted, textDecoration: "underline" }}>
            {t("sidebar.githubRepo")}
          </a>
        </div>
      </div>
    </div>
  );
}
