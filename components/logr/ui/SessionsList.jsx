import { formatDate, formatTime } from "../lib/utils";

export default function SessionsList({
  theme,
  statusColors,
  running,
  visibleSessions,
  activeProjects,
  editId,
  editValues,
  setEditValues,
  onStartPending,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDeleteSession,
}) {
  const inputStyle = {
    background: "transparent",
    border: "none",
    outline: "none",
    fontFamily: "inherit",
    color: theme.inputColor,
  };

  if (visibleSessions.length === 0) {
    return <div style={{ color: theme.muted, fontSize: 11, letterSpacing: "0.1em", padding: "20px 0" }}>NO SESSIONS YET</div>;
  }

  return (
    <>
      {visibleSessions.map((session) => {
        const project = activeProjects.find((item) => item.id === session.projectId);
        const isEditing = editId === session.id;
        const billingType = session.billingType || "hourly";
        const doneAmount = billingType === "fixed_project"
          ? parseFloat(session.fixedAmount || 0)
          : parseFloat(session.earned || 0);

        return (
          <div key={session.id} className="row" style={{ borderBottom: `1px solid ${theme.rowBorder}`, padding: "11px 0" }}>
            {isEditing ? (
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <input value={editValues.name} onChange={(event) => setEditValues((prev) => ({ ...prev, name: event.target.value }))} style={{ ...inputStyle, flex: 1, fontSize: 13, borderBottom: `1px solid ${theme.border}`, paddingBottom: 2, minWidth: 120 }} />
                <input value={editValues.notes || ""} onChange={(event) => setEditValues((prev) => ({ ...prev, notes: event.target.value }))} placeholder="notes..." style={{ ...inputStyle, flex: 1, fontSize: 11, borderBottom: `1px solid ${theme.border}`, paddingBottom: 2, minWidth: 100, color: theme.muted }} />
                <select
                  value={editValues.billingType || "hourly"}
                  onChange={(event) => setEditValues((prev) => ({ ...prev, billingType: event.target.value }))}
                  style={{ ...inputStyle, fontSize: 10, borderBottom: `1px solid ${theme.border}`, paddingBottom: 2, minWidth: 110, colorScheme: theme.colorScheme }}
                >
                  <option value="hourly">HOURLY</option>
                  <option value="fixed_project">FIXED</option>
                </select>
                <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                  <input type="number" value={editValues.hours} onChange={(event) => setEditValues((prev) => ({ ...prev, hours: event.target.value }))} style={{ ...inputStyle, width: 40, fontSize: 12, borderBottom: `1px solid ${theme.border}`, textAlign: "center" }} />
                  <span style={{ color: theme.muted, fontSize: 10 }}>h</span>
                  <input type="number" value={editValues.minutes} onChange={(event) => setEditValues((prev) => ({ ...prev, minutes: event.target.value }))} style={{ ...inputStyle, width: 40, fontSize: 12, borderBottom: `1px solid ${theme.border}`, textAlign: "center" }} />
                  <span style={{ color: theme.muted, fontSize: 10 }}>m</span>
                  <span style={{ color: theme.muted, fontSize: 10, marginLeft: 4 }}>$</span>
                  {editValues.billingType === "hourly" ? (
                    <>
                      <input
                        type="number"
                        value={editValues.rate}
                        onChange={(event) => setEditValues((prev) => ({ ...prev, rate: event.target.value }))}
                        style={{ ...inputStyle, width: 56, fontSize: 12, borderBottom: `1px solid ${theme.border}`, textAlign: "center" }}
                      />
                      <span style={{ color: theme.muted, fontSize: 10 }}>/hr</span>
                    </>
                  ) : (
                    <>
                      <span style={{ color: theme.sessionText, fontSize: 11 }}>{parseFloat(editValues.fixedAmount || 0).toFixed(2)}</span>
                      <span style={{ color: theme.muted, fontSize: 10 }}>fixed</span>
                    </>
                  )}
                </div>
                <button onClick={() => onSaveEdit(session)} style={{ background: theme.btnBg, color: theme.btnColor, border: "none", cursor: "pointer", padding: "4px 12px", fontFamily: "inherit", fontSize: 11, letterSpacing: "0.1em" }}>
                  SAVE
                </button>
                <button onClick={onCancelEdit} style={{ background: "none", border: `1px solid ${theme.border}`, color: theme.muted, cursor: "pointer", padding: "4px 10px", fontFamily: "inherit", fontSize: 11 }}>
                  ✕
                </button>
              </div>
            ) : (
              <div className="session-row" style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "space-between" }}>
                <div className="session-main" style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: statusColors[session.status], flexShrink: 0 }} />
                  <div style={{ fontSize: 10, color: theme.sessionDate, minWidth: 48 }}>{formatDate(session.ts)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: theme.sessionText, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{session.name}</div>
                    {(project || session.notes) && (
                      <div
                        className="session-notes"
                        style={{
                          fontSize: 10,
                          color: theme.muted,
                          marginTop: 2,
                          overflowWrap: "break-word",
                          wordBreak: "normal",
                        }}
                      >
                        {project ? `[${project.name}] ` : ""}
                        {session.notes || ""}
                      </div>
                    )}
                  </div>
                </div>

                <div className="session-meta" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ fontSize: 9, color: statusColors[session.status], letterSpacing: "0.1em" }}>{session.status}</div>
                  {session.status === "PENDING" && !running && (
                    <button onClick={() => onStartPending(session)} style={{ fontSize: 10, background: "none", border: `1px solid ${theme.border}`, color: theme.muted, cursor: "pointer", padding: "2px 8px", fontFamily: "inherit" }}>
                      ▶
                    </button>
                  )}
                  {session.duration > 0 && <div style={{ fontSize: 12, color: theme.sessionTime }}>{formatTime(session.duration)}</div>}
                  {session.status === "DONE" && <div style={{ fontSize: 13, color: statusColors.DONE }}>${doneAmount.toFixed(2)}</div>}
                  <button className="del" onClick={() => onStartEdit(session)} style={{ opacity: 0, background: "none", border: "none", color: theme.muted, cursor: "pointer", fontSize: 13, padding: "0 3px", transition: "opacity 0.15s" }}>
                    ✎
                  </button>
                  <button className="del" onClick={() => onDeleteSession(session.id)} style={{ opacity: 0, background: "none", border: "none", color: theme.muted, cursor: "pointer", fontSize: 16, padding: "0 4px", transition: "opacity 0.15s" }}>
                    ×
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
