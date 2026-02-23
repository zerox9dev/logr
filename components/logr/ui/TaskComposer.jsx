export default function TaskComposer({
  theme,
  currency,
  running,
  paused,
  taskName,
  setTaskName,
  taskRate,
  setTaskRate,
  profileHourlyRate,
  profileWorkdayHours,
  taskBillingType,
  setTaskBillingType,
  taskStatus,
  setTaskStatus,
  taskDays,
  setTaskDays,
  taskHours,
  setTaskHours,
  taskMinutes,
  setTaskMinutes,
  taskFixedAmount,
  setTaskFixedAmount,
  taskDateTime,
  setTaskDateTime,
  taskNotes,
  setTaskNotes,
  onSubmit,
  onPause,
  onResume,
  onStop,
  errors,
}) {
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
          <div className="task-top-row" style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <div style={{ flex: 1, border: `1px solid ${theme.border}`, padding: "10px 14px" }}>
              <div style={{ fontSize: 9, color: theme.muted, letterSpacing: "0.15em", marginBottom: 4 }}>TASK</div>
              <input data-tour="task-name-input" value={taskName} onChange={(event) => setTaskName(event.target.value)} placeholder="what are you working on?" style={{ ...inputStyle, width: "100%", fontSize: 14 }} onKeyDown={(event) => event.key === "Enter" && onSubmit()} />
            </div>
            <div className="task-date-box" style={{ width: 186, border: `1px solid ${theme.border}`, padding: "10px 14px" }}>
              <div style={{ fontSize: 9, color: theme.muted, letterSpacing: "0.15em", marginBottom: 4 }}>DATE & TIME</div>
              <input
                type="datetime-local"
                value={taskDateTime}
                onChange={(event) => setTaskDateTime(event.target.value)}
                style={{ ...inputStyle, width: "100%", fontSize: 12, colorScheme: theme.colorScheme }}
              />
            </div>
            <div className="task-rate-box" style={{ width: taskBillingType === "hourly" ? 190 : 210, border: `1px solid ${theme.border}`, padding: "10px 14px" }}>
              <div style={{ display: "flex", gap: 4, marginBottom: 8, flexWrap: "wrap" }}>
                {[["hourly", "HOURLY"], ["fixed_project", "FIXED"]].map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => {
                      setTaskBillingType(value);
                      if (value === "fixed_project" && taskStatus === "ACTIVE") {
                        setTaskStatus("DONE");
                      }
                    }}
                    style={{
                      padding: "4px 8px",
                      background: taskBillingType === value ? theme.tabActiveBg : "transparent",
                      border: `1px solid ${theme.border}`,
                      color: taskBillingType === value ? theme.tabActive : theme.tabInactive,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      fontSize: 10,
                      letterSpacing: "0.1em",
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {taskBillingType === "hourly" ? (
                <>
                  <div style={{ fontSize: 9, color: theme.muted, letterSpacing: "0.15em", marginBottom: 4 }}>{currency}/HR</div>
                  <input type="number" min="0" step="0.01" value={taskRate} onChange={(event) => setTaskRate(event.target.value)} placeholder={profileHourlyRate || "0"} style={{ ...inputStyle, width: "100%", fontSize: 14 }} />
                </>
              ) : (
                <>
                  <div style={{ fontSize: 9, color: theme.muted, letterSpacing: "0.15em", marginBottom: 4 }}>FIXED {currency}</div>
                  <input type="number" min="0" step="0.01" value={taskFixedAmount} onChange={(event) => setTaskFixedAmount(event.target.value)} placeholder="amount" style={{ ...inputStyle, width: "100%", fontSize: 14 }} />
                </>
              )}
            </div>
          </div>
          <div style={{ border: `1px solid ${theme.border}`, padding: "8px 14px", marginBottom: 8 }}>
            <div style={{ fontSize: 9, color: theme.muted, letterSpacing: "0.15em", marginBottom: 4 }}>
              NOTES <span style={{ color: theme.faint }}>OPTIONAL</span>
            </div>
            <input value={taskNotes} onChange={(event) => setTaskNotes(event.target.value)} placeholder="what exactly did you do?" style={{ ...inputStyle, width: "100%", fontSize: 13 }} />
          </div>
          <div className="task-action-row" style={{ display: "flex", gap: 8 }}>
            <div style={{ width: 280, border: `1px solid ${theme.border}`, padding: "8px 10px" }}>
              <div style={{ fontSize: 9, color: theme.muted, letterSpacing: "0.15em", marginBottom: 4 }}>TIME</div>
              <div style={{ fontSize: 9, color: theme.muted, marginBottom: 6 }}>1 day = {profileWorkdayHours || "8"} hrs (profile setting)</div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input type="number" min="0" value={taskDays} onChange={(event) => setTaskDays(event.target.value)} placeholder="0" style={{ ...inputStyle, width: 46, fontSize: 12, borderBottom: `1px solid ${theme.border}`, textAlign: "center" }} />
                <span style={{ fontSize: 9, color: theme.muted }}>DAYS</span>
                <input type="number" min="0" value={taskHours} onChange={(event) => setTaskHours(event.target.value)} placeholder="0" style={{ ...inputStyle, width: 46, fontSize: 12, borderBottom: `1px solid ${theme.border}`, textAlign: "center" }} />
                <span style={{ fontSize: 9, color: theme.muted }}>HRS</span>
                <input type="number" min="0" max="59" value={taskMinutes} onChange={(event) => setTaskMinutes(event.target.value)} placeholder="0" style={{ ...inputStyle, width: 46, fontSize: 12, borderBottom: `1px solid ${theme.border}`, textAlign: "center" }} />
                <span style={{ fontSize: 9, color: theme.muted }}>MIN</span>
              </div>
            </div>
            <div style={{ width: 150, border: `1px solid ${theme.border}`, padding: "8px 10px" }}>
              <div style={{ fontSize: 9, color: theme.muted, letterSpacing: "0.15em", marginBottom: 4 }}>STATUS</div>
              <select
                data-tour="status-select"
                value={taskStatus}
                onChange={(event) => setTaskStatus(event.target.value)}
                style={{ ...inputStyle, width: "100%", fontSize: 11, colorScheme: theme.colorScheme }}
              >
                {taskBillingType === "hourly" && <option value="ACTIVE">ACTIVE</option>}
                <option value="PENDING">PENDING</option>
                <option value="DONE">DONE</option>
              </select>
            </div>
            <button
              data-tour="submit-task-btn"
              onClick={onSubmit}
              disabled={!taskName.trim()}
              style={{ flex: 1, padding: "12px", background: theme.btnBg, color: theme.btnColor, border: `1px solid ${theme.border}`, cursor: "pointer", fontFamily: "inherit", fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", opacity: !taskName.trim() ? 0.3 : 1 }}
            >
              {taskStatus === "ACTIVE" ? "▶ START" : taskStatus === "PENDING" ? "+ ADD PENDING" : "✓ ADD DONE"}
            </button>
          </div>
          {(errors.task || errors.rate || errors.status || errors.duration) && <div style={{ fontSize: 11, color: "#ff4444", marginTop: 6, letterSpacing: "0.05em" }}>{errors.task || errors.rate || errors.status || errors.duration}</div>}
          {taskBillingType === "hourly" && taskStatus === "ACTIVE" ? (
            <div style={{ fontSize: 9, color: theme.faint, marginTop: 6, letterSpacing: "0.12em" }}>SPACE TO START / STOP</div>
          ) : taskBillingType === "fixed_project" ? (
            <div style={{ fontSize: 9, color: theme.faint, marginTop: 6, letterSpacing: "0.12em" }}>FIXED MODE: TIMER DISABLED</div>
          ) : (
            <div style={{ fontSize: 9, color: theme.faint, marginTop: 6, letterSpacing: "0.12em" }}>STATUS WILL BE SAVED WITHOUT TIMER</div>
          )}
        </div>
      )}
      {running && (
        <>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <button
              onClick={paused ? onResume : onPause}
              style={{ flex: 1, padding: "14px", background: theme.btnBg, color: theme.btnColor, border: `1px solid ${theme.border}`, cursor: "pointer", fontFamily: "inherit", fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase" }}
            >
              {paused ? "▶ RESUME" : "❚❚ PAUSE"}
            </button>
            <button onClick={onStop} style={{ flex: 1, padding: "14px", background: "#c45757", color: "#fff", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              ■ STOP
            </button>
          </div>
          <div style={{ fontSize: 9, color: theme.faint, marginTop: 2, marginBottom: 16, letterSpacing: "0.12em" }}>
            SPACE = {paused ? "RESUME" : "STOP"}
          </div>
        </>
      )}
    </>
  );
}
