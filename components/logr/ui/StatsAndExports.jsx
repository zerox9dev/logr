import { formatMoney } from "../lib/utils";

export default function StatsAndExports({ theme, currency, doneSessions, totalHours, totalEarned, paidTotal, unpaidTotal, collectionRate, hasUnpaidSessions, onExportCsv, onExportInvoicePdf }) {
  if (doneSessions.length === 0) return null;

  return (
    <>
      <div className="stats-row" style={{ display: "flex", gap: 1, marginBottom: 20 }}>
        {[
          { label: "DONE", value: doneSessions.length },
          { label: "HRS", value: totalHours },
          { label: `${currency} EARNED`, value: formatMoney(totalEarned, currency) },
          { label: `${currency} UNPAID`, value: formatMoney(unpaidTotal, currency) },
          { label: `${currency} PAID`, value: formatMoney(paidTotal, currency) },
          { label: "COLLECTION %", value: collectionRate },
        ].map((stat) => (
          <div key={stat.label} style={{ flex: 1, background: theme.statBg, padding: "10px 14px", border: `1px solid ${theme.border}` }}>
            <div style={{ fontSize: 9, color: theme.muted, letterSpacing: "0.15em", marginBottom: 2 }}>{stat.label}</div>
            <div style={{ fontSize: 26, fontFamily: "'Inter Tight',sans-serif", fontWeight: 400, letterSpacing: "-0.02em", color: theme.timerColor }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="export-row" style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <button onClick={onExportCsv} style={{ flex: 1, padding: "9px", background: "transparent", border: `1px solid ${theme.border}`, color: theme.muted, cursor: "pointer", fontFamily: "inherit", fontSize: 11, letterSpacing: "0.15em" }}>
          ↓ CSV
        </button>
        <button
          data-tour="invoice-btn"
          onClick={onExportInvoicePdf}
          disabled={!hasUnpaidSessions}
          style={{
            flex: 1,
            padding: "9px",
            background: "transparent",
            border: `1px solid ${theme.border}`,
            color: theme.muted,
            cursor: hasUnpaidSessions ? "pointer" : "not-allowed",
            opacity: hasUnpaidSessions ? 1 : 0.5,
            fontFamily: "inherit",
            fontSize: 11,
            letterSpacing: "0.15em",
          }}
        >
          ↓ INVOICE PDF
        </button>
      </div>
    </>
  );
}
