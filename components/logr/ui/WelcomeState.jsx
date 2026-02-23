export default function WelcomeState({ theme }) {
  return (
    <div style={{ marginTop: 60, maxWidth: 360 }}>
      <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 44, fontWeight: 400, color: theme.timerColor, letterSpacing: "-0.02em", marginBottom: 12, lineHeight: 1.05 }}>
        WELCOME TO LOGR
      </div>
      <div style={{ fontSize: 12, color: theme.muted, lineHeight: 1.8, marginBottom: 32 }}>
        Track time, log tasks, generate invoices.
      </div>
      {[
        ["1", "Add a client", "Click + CLIENT in the sidebar"],
        ["2", "Add a project", "Optional — group tasks by project"],
        ["3", "Start tracking", "Type a task → press SPACE or ▶ START"],
        ["4", "Export", "CSV or PDF invoice when done"],
      ].map(([n, title, desc]) => (
        <div key={n} style={{ display: "flex", gap: 16, marginBottom: 20, alignItems: "flex-start" }}>
          <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 26, color: theme.muted, minWidth: 20 }}>{n}</div>
          <div>
            <div style={{ fontSize: 12, color: theme.text, letterSpacing: "0.05em" }}>{title}</div>
            <div style={{ fontSize: 11, color: theme.muted, marginTop: 2 }}>{desc}</div>
          </div>
        </div>
      ))}
      <div style={{ fontSize: 10, color: theme.faint, letterSpacing: "0.15em", marginTop: 8 }}>SHORTCUT: SPACE = START / STOP</div>
    </div>
  );
}
