export default function ManualEntry({ theme, showManual, setShowManual, manual, setManual, onAddManual, errors }) {
  const inputStyle = {
    background: "transparent",
    border: "none",
    outline: "none",
    fontFamily: "inherit",
    color: theme.inputColor,
  };

  return (
    <>
      <button
        onClick={() => setShowManual((value) => !value)}
        style={{ width: "100%", marginBottom: 16, padding: "9px", background: "transparent", border: `1px solid ${theme.border}`, color: theme.muted, cursor: "pointer", fontFamily: "inherit", fontSize: 11, letterSpacing: "0.15em" }}
      >
        {showManual ? "▲ CANCEL" : "+ ADD MANUALLY"}
      </button>

      {showManual && (
        <div style={{ border: `1px solid ${theme.border}`, padding: 16, marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <div style={{ flex: 1, borderBottom: `1px solid ${theme.border}`, paddingBottom: 6 }}>
              <div style={{ fontSize: 9, color: theme.muted, letterSpacing: "0.15em", marginBottom: 4 }}>TASK</div>
              <input value={manual.name} onChange={(event) => setManual((prev) => ({ ...prev, name: event.target.value }))} placeholder="task name" style={{ ...inputStyle, width: "100%", fontSize: 13 }} />
            </div>
            <div style={{ width: 140, borderBottom: `1px solid ${theme.border}`, paddingBottom: 6 }}>
              <div style={{ fontSize: 9, color: theme.muted, letterSpacing: "0.15em", marginBottom: 4 }}>DATE</div>
              <input type="date" value={manual.date} onChange={(event) => setManual((prev) => ({ ...prev, date: event.target.value }))} style={{ ...inputStyle, width: "100%", fontSize: 13, colorScheme: theme.colorScheme }} />
            </div>
          </div>
          <div style={{ borderBottom: `1px solid ${theme.border}`, paddingBottom: 6, marginBottom: 8 }}>
            <div style={{ fontSize: 9, color: theme.muted, letterSpacing: "0.15em", marginBottom: 4 }}>
              NOTES <span style={{ color: theme.faint }}>OPTIONAL</span>
            </div>
            <input value={manual.notes} onChange={(event) => setManual((prev) => ({ ...prev, notes: event.target.value }))} placeholder="details for the invoice" style={{ ...inputStyle, width: "100%", fontSize: 13 }} />
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            {[["HRS", "hours"], ["MIN", "minutes"], ["$/HR", "rate"]].map(([label, key]) => (
              <div key={key} style={{ flex: 1, borderBottom: `1px solid ${theme.border}`, paddingBottom: 6 }}>
                <div style={{ fontSize: 9, color: theme.muted, letterSpacing: "0.15em", marginBottom: 4 }}>{label}</div>
                <input type="number" value={manual[key]} onChange={(event) => setManual((prev) => ({ ...prev, [key]: event.target.value }))} placeholder="0" style={{ ...inputStyle, width: "100%", fontSize: 13 }} />
              </div>
            ))}
            <div style={{ flex: 1, borderBottom: `1px solid ${theme.border}`, paddingBottom: 6 }}>
              <div style={{ fontSize: 9, color: theme.muted, letterSpacing: "0.15em", marginBottom: 4 }}>STATUS</div>
              <select value={manual.status} onChange={(event) => setManual((prev) => ({ ...prev, status: event.target.value }))} style={{ ...inputStyle, width: "100%", fontSize: 11, colorScheme: theme.colorScheme }}>
                <option value="PENDING">PENDING</option>
                <option value="DONE">DONE</option>
              </select>
            </div>
          </div>
          {errors.manual && <div style={{ fontSize: 11, color: "#ff4444", marginBottom: 8, letterSpacing: "0.05em" }}>{errors.manual}</div>}
          <button onClick={onAddManual} style={{ width: "100%", padding: "10px", background: theme.btnBg, color: theme.btnColor, border: "none", cursor: "pointer", fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, letterSpacing: "0.1em" }}>
            ADD
          </button>
        </div>
      )}
    </>
  );
}
