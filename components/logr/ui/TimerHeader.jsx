import { formatTime } from "../lib/utils";

export default function TimerHeader({ theme, activeClient, activeTimedSession, elapsed, running, paused }) {
  return (
    <div style={{ marginBottom: 32, borderBottom: `1px solid ${theme.border}`, paddingBottom: 20 }}>
      <div style={{ fontSize: 9, color: theme.muted, letterSpacing: "0.2em", marginBottom: 4 }}>
        {activeClient.name}
        {activeTimedSession ? ` / ${activeTimedSession.name}` : ""}
      </div>
      <div className="timer-value" style={{ fontFamily: "'Inter Tight',sans-serif", fontSize: 56, letterSpacing: "-0.02em", lineHeight: 1, color: theme.timerColor }}>
        {formatTime(elapsed)}
        {running && !paused && (
          <span className="blink" style={{ color: "#d35b5b", marginLeft: 12, fontSize: 14 }}>
            ●
          </span>
        )}
        {running && paused && (
          <span style={{ color: theme.muted, marginLeft: 10, fontSize: 11, letterSpacing: "0.12em" }}>
            PAUSED
          </span>
        )}
      </div>
    </div>
  );
}
