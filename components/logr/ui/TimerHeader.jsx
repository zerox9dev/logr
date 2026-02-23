import { formatTime } from "../lib/utils";

export default function TimerHeader({ theme, activeClient, activeTimedSession, elapsed, running }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ fontSize: 9, color: theme.muted, letterSpacing: "0.2em", marginBottom: 4 }}>
        {activeClient.name}
        {activeTimedSession ? ` / ${activeTimedSession.name}` : ""}
      </div>
      <div className="timer-value" style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 56, letterSpacing: "0.05em", lineHeight: 1, color: theme.timerColor }}>
        {formatTime(elapsed)}
        {running && (
          <span className="blink" style={{ color: "#ff4444", marginLeft: 12, fontSize: 14 }}>
            ●
          </span>
        )}
      </div>
    </div>
  );
}
