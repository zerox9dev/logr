import { useState } from "react";

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
}) {
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
      <div style={{ fontSize: 9, color: theme.muted, letterSpacing: "0.2em", padding: "0 20px", marginBottom: 8 }}>APP</div>
      <div style={{ display: "grid", gap: 4, padding: "0 20px", marginBottom: 18 }}>
        {[["dashboard", "DASHBOARD"], ["tracker", "TRACKER"]].map(([value, label]) => (
          <button
            key={value}
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
            {label}
          </button>
        ))}
      </div>

      {screen === "tracker" ? (
        <>
          <div style={{ fontSize: 9, color: theme.muted, letterSpacing: "0.2em", padding: "0 20px", marginBottom: 16 }}>CLIENTS</div>

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
                aria-label="Edit client name"
                title="Edit client name"
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
                placeholder="Client name"
                onKeyDown={(event) => {
                  if (event.key === "Enter") onAddClient();
                  if (event.key === "Escape") setShowAddClient(false);
                }}
                style={{ ...inputStyle, width: "100%", fontSize: 12, borderBottom: `1px solid ${theme.border}`, paddingBottom: 4 }}
              />
            </div>
          ) : (
            <button
              onClick={() => setShowAddClient(true)}
              style={{ margin: "8px 20px 0", padding: "6px 0", background: "none", border: `1px dashed ${theme.border}`, color: theme.muted, cursor: "pointer", fontFamily: "inherit", fontSize: 11, letterSpacing: "0.1em" }}
            >
              + CLIENT
            </button>
          )}
        </>
      ) : null}

      <div style={{ marginTop: "auto", padding: "0 20px" }}>
        <button
          onClick={onToggleTheme}
          style={{ background: "none", border: `1px solid ${theme.border}`, color: theme.muted, cursor: "pointer", padding: "6px 10px", fontSize: 10, fontFamily: "inherit", letterSpacing: "0.1em", width: "100%" }}
        >
          {dark ? "☀ LIGHT" : "☾ DARK"}
        </button>
      </div>
    </div>
  );
}
