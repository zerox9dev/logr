export default function TaskComposer({ theme, running, taskName, setTaskName, taskRate, setTaskRate, taskNotes, setTaskNotes, onStart, onAddPending, onStop, errors }) {
  const inputStyle = {
    background: "transparent",
    border: "none",
    outline: "none",
    fontFamily: "inherit",
    color: theme.inputColor,
  };

  return (
    <>
      {!running && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <div style={{ flex: 1, border: `1px solid ${theme.border}`, padding: "10px 14px" }}>
              <div style={{ fontSize: 9, color: theme.muted, letterSpacing: "0.15em", marginBottom: 4 }}>TASK</div>
              <input value={taskName} onChange={(event) => setTaskName(event.target.value)} placeholder="what are you working on?" style={{ ...inputStyle, width: "100%", fontSize: 14 }} onKeyDown={(event) => event.key === "Enter" && onStart()} />
            </div>
            <div style={{ width: 90, border: `1px solid ${theme.border}`, padding: "10px 14px" }}>
              <div style={{ fontSize: 9, color: theme.muted, letterSpacing: "0.15em", marginBottom: 4 }}>$/HR</div>
              <input type="number" value={taskRate} onChange={(event) => setTaskRate(event.target.value)} style={{ ...inputStyle, width: "100%", fontSize: 14 }} />
            </div>
          </div>
          <div style={{ border: `1px solid ${theme.border}`, padding: "8px 14px", marginBottom: 8 }}>
            <div style={{ fontSize: 9, color: theme.muted, letterSpacing: "0.15em", marginBottom: 4 }}>
              NOTES <span style={{ color: theme.faint }}>OPTIONAL</span>
            </div>
            <input value={taskNotes} onChange={(event) => setTaskNotes(event.target.value)} placeholder="what exactly did you do?" style={{ ...inputStyle, width: "100%", fontSize: 13 }} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onStart} disabled={!taskName.trim()} style={{ flex: 1, padding: "12px", background: theme.btnBg, color: theme.btnColor, border: "none", cursor: "pointer", fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, letterSpacing: "0.1em", opacity: !taskName.trim() ? 0.3 : 1 }}>
              ▶ START
            </button>
            <button onClick={onAddPending} disabled={!taskName.trim()} style={{ flex: 1, padding: "12px", background: "transparent", border: `1px solid ${theme.border}`, color: theme.muted, cursor: "pointer", fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, letterSpacing: "0.1em", opacity: !taskName.trim() ? 0.3 : 1 }}>
              + PENDING
            </button>
          </div>
          {(errors.task || errors.rate) && <div style={{ fontSize: 11, color: "#ff4444", marginTop: 6, letterSpacing: "0.05em" }}>{errors.task || errors.rate}</div>}
          <div style={{ fontSize: 9, color: theme.faint, marginTop: 6, letterSpacing: "0.12em" }}>SPACE TO START / STOP</div>
        </div>
      )}
      {running && (
        <button onClick={onStop} style={{ width: "100%", padding: "14px", background: "#ff4444", color: "#fff", border: "none", cursor: "pointer", fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, letterSpacing: "0.1em", marginBottom: 16 }}>
          ■ STOP
        </button>
      )}
    </>
  );
}
