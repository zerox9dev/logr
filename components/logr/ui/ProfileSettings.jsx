export default function ProfileSettings({
  theme,
  user,
  syncError,
  onSignOut,
  hourlyRate,
  setHourlyRate,
  targetHourlyRate,
  setTargetHourlyRate,
  workdayHours,
  setWorkdayHours,
  requireProjectForFixed,
  setRequireProjectForFixed,
}) {
  const inputStyle = {
    background: "transparent",
    border: "none",
    outline: "none",
    fontFamily: "inherit",
    color: theme.inputColor,
    width: "100%",
    fontSize: 14,
  };
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || "";
  const fallbackLabel = (user?.email || "U").slice(0, 1).toUpperCase();

  return (
    <div style={{ maxWidth: 520 }}>
      <div style={{ fontSize: 11, color: theme.muted, letterSpacing: "0.16em", marginBottom: 12 }}>PROFILE SETTINGS</div>
      <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 36, fontWeight: 400, letterSpacing: "-0.02em", marginBottom: 16 }}>Account</div>
      <div style={{ border: `1px solid ${theme.border}`, padding: 16, marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="avatar" style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", border: `1px solid ${theme.border}` }} />
          ) : (
            <div style={{ width: 44, height: 44, borderRadius: "50%", border: `1px solid ${theme.border}`, display: "grid", placeItems: "center", fontSize: 16, color: theme.sessionText }}>
              {fallbackLabel}
            </div>
          )}
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 11, color: theme.sessionText, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={user?.email || ""}>
              {user?.email || "No user"}
            </div>
            <div style={{ fontSize: 10, color: syncError ? "#cc2222" : theme.muted, marginTop: 2 }}>
              {syncError ? syncError : "Synced with Supabase"}
            </div>
          </div>
          <button
            onClick={onSignOut}
            style={{ border: `1px solid ${theme.border}`, borderRadius: 8, padding: "7px 10px", background: "transparent", color: theme.text, cursor: "pointer", fontFamily: "inherit", fontSize: 10, letterSpacing: "0.1em" }}
          >
            SIGN OUT
          </button>
        </div>
      </div>
      <div style={{ border: `1px solid ${theme.border}`, padding: 16, marginBottom: 10 }}>
        <div style={{ fontSize: 9, color: theme.muted, letterSpacing: "0.15em", marginBottom: 6 }}>DEFAULT HOURLY RATE ($/HR)</div>
        <input type="number" min="0" step="0.01" value={hourlyRate} onChange={(event) => setHourlyRate(event.target.value)} style={inputStyle} />
      </div>
      <div style={{ border: `1px solid ${theme.border}`, padding: 16, marginBottom: 10 }}>
        <div style={{ fontSize: 9, color: theme.muted, letterSpacing: "0.15em", marginBottom: 6 }}>TARGET HOURLY RATE ($/HR)</div>
        <input type="number" min="0" step="0.01" value={targetHourlyRate} onChange={(event) => setTargetHourlyRate(event.target.value)} style={inputStyle} />
      </div>
      <div style={{ border: `1px solid ${theme.border}`, padding: 16 }}>
        <div style={{ fontSize: 9, color: theme.muted, letterSpacing: "0.15em", marginBottom: 6 }}>WORKDAY HOURS (1 DAY = ? HOURS)</div>
        <input type="number" min="1" step="0.5" value={workdayHours} onChange={(event) => setWorkdayHours(event.target.value)} style={inputStyle} />
      </div>
      <div style={{ border: `1px solid ${theme.border}`, padding: 16, marginTop: 10 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: theme.sessionText, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={requireProjectForFixed}
            onChange={(event) => setRequireProjectForFixed(event.target.checked)}
            style={{ accentColor: theme.tabActive }}
          />
          Require project for fixed tasks
        </label>
      </div>
      <div style={{ marginTop: 10, fontSize: 10, color: theme.muted }}>These values are used in tracker calculations automatically.</div>
    </div>
  );
}
