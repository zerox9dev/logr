export default function StatsAndExports({ theme, doneSessions, totalHours, totalEarned, onExportCsv, onExportInvoicePdf }) {
  if (doneSessions.length === 0) return null;

  return (
    <>
      <div className="stats-row" style={{ display: "flex", gap: 1, marginBottom: 20 }}>
        {[
          { label: "DONE", value: doneSessions.length },
          { label: "HRS", value: totalHours },
          { label: "EARNED $", value: totalEarned },
        ].map((stat) => (
          <div key={stat.label} style={{ flex: 1, background: theme.statBg, padding: "10px 14px" }}>
            <div style={{ fontSize: 9, color: theme.muted, letterSpacing: "0.15em", marginBottom: 2 }}>{stat.label}</div>
            <div style={{ fontSize: 18, fontFamily: "'Bebas Neue',sans-serif", color: theme.timerColor }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="export-row" style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <button onClick={onExportCsv} style={{ flex: 1, padding: "9px", background: "transparent", border: `1px solid ${theme.border}`, color: theme.muted, cursor: "pointer", fontFamily: "inherit", fontSize: 11, letterSpacing: "0.15em" }}>
          ↓ CSV
        </button>
        <button onClick={onExportInvoicePdf} style={{ flex: 1, padding: "9px", background: "transparent", border: `1px solid ${theme.border}`, color: theme.muted, cursor: "pointer", fontFamily: "inherit", fontSize: 11, letterSpacing: "0.15em" }}>
          ↓ INVOICE PDF
        </button>
      </div>
    </>
  );
}
