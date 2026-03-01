import { useTranslation } from "react-i18next";

function MenuIcon({ name, color }) {
  const common = { width: 14, height: 14, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };
  if (name === "dashboard") {
    return (
      <svg {...common}>
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="5" />
        <rect x="14" y="11" width="7" height="10" />
        <rect x="3" y="13" width="7" height="8" />
      </svg>
    );
  }
  if (name === "tracker") {
    return (
      <svg {...common}>
        <circle cx="12" cy="13" r="8" />
        <path d="M12 13V8" />
        <path d="M12 13L16 15" />
      </svg>
    );
  }
  if (name === "clients") {
    return (
      <svg {...common}>
        <circle cx="9" cy="9" r="3" />
        <circle cx="16.5" cy="10.5" r="2.5" />
        <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
        <path d="M13 20a4.5 4.5 0 0 1 8 0" />
      </svg>
    );
  }
  if (name === "pipeline") {
    return (
      <svg {...common}>
        <rect x="3" y="6" width="5" height="12" />
        <rect x="10" y="9" width="5" height="9" />
        <rect x="17" y="12" width="4" height="6" />
      </svg>
    );
  }
  if (name === "invoices") {
    return (
      <svg {...common}>
        <path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" />
        <path d="M9 8h6" />
        <path d="M9 12h6" />
        <path d="M9 16h4" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </svg>
  );
}

export default function Sidebar({
  theme,
  dark,
  screen,
  mobileView,
  onSelectScreen,
  onToggleTheme,
  onOpenOnboarding,
}) {
  const { t } = useTranslation();

  return (
    <div
      className={`sidebar${mobileView === "clients" ? " mobile-open" : ""}`}
      style={{
        width: 200,
        borderRight: `1px solid ${theme.border}`,
        padding: "32px 0",
        flexShrink: 0,
        flexDirection: "column",
        background: "#f6f7f9",
        height: "100vh",
        position: "sticky",
        top: 0,
      }}
    >
      <div style={{ fontSize: 9, color: theme.muted, letterSpacing: "0.2em", padding: "0 20px", marginBottom: 8 }}>{t("sidebar.app")}</div>
      <div style={{ display: "grid", gap: 4, padding: "0 20px", marginBottom: 18 }}>
        {[
          ["dashboard", t("sidebar.dashboard")],
          ["tracker", t("sidebar.tracker")],
          ["clients", t("sidebar.clients")],
          ["pipeline", t("sidebar.pipeline")],
          ["invoices", t("sidebar.invoices")],
        ].map(([value, label]) => (
          <button
            key={value}
            data-tour={value === "tracker" ? "tracker-tab" : value === "clients" ? "clients-tab" : undefined}
            onClick={() => onSelectScreen(value)}
            style={{
              padding: "6px 10px",
              background: screen === value ? theme.tabActiveBg : "transparent",
              border: `1px solid ${theme.border}`,
              color: screen === value ? theme.tabActive : theme.tabInactive,
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 10,
              letterSpacing: "0.12em",
              textAlign: "left",
            }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <span aria-hidden style={{ width: 14, height: 14, display: "inline-grid", placeItems: "center" }}>
                <MenuIcon name={value} color={screen === value ? theme.tabActive : theme.tabInactive} />
              </span>
              <span>{label}</span>
            </span>
          </button>
        ))}
      </div>

      <div style={{ marginTop: "auto", padding: "0 20px" }}>
        <button
          onClick={() => onSelectScreen("profile")}
          style={{ width: "100%", marginBottom: 10, background: screen === "profile" ? theme.tabActiveBg : "none", border: `1px solid ${theme.border}`, color: screen === "profile" ? theme.tabActive : theme.muted, cursor: "pointer", padding: "6px 10px", fontSize: 10, fontFamily: "inherit", letterSpacing: "0.1em" }}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <span aria-hidden style={{ width: 14, height: 14, display: "inline-grid", placeItems: "center" }}>
              <MenuIcon name="profile" color={screen === "profile" ? theme.tabActive : theme.muted} />
            </span>
            <span>{t("sidebar.profile")}</span>
          </span>
        </button>
        <button
          onClick={onToggleTheme}
          style={{ background: "none", border: `1px solid ${theme.border}`, color: theme.muted, cursor: "pointer", padding: "6px 10px", fontSize: 10, fontFamily: "inherit", letterSpacing: "0.1em", width: "100%" }}
        >
          {dark ? t("sidebar.light") : t("sidebar.dark")}
        </button>
        <button
          onClick={onOpenOnboarding}
          style={{ width: "100%", marginTop: 10, background: "none", border: `1px solid ${theme.border}`, color: theme.muted, cursor: "pointer", padding: "6px 10px", fontSize: 10, fontFamily: "inherit", letterSpacing: "0.1em" }}
        >
          {t("sidebar.onboarding")}
        </button>
        <div
          style={{
            marginTop: 10,
            fontSize: 10,
            color: theme.muted,
            letterSpacing: "0.08em",
            textAlign: "center",
          }}
        >
          {t("sidebar.madeBy")}{" "}
          <a href="https://zerox9dev.com" target="_blank" rel="noreferrer" style={{ color: theme.muted, textDecoration: "underline" }}>
            zerox9dev
          </a>
        </div>
        <div
          style={{
            marginTop: 6,
            fontSize: 10,
            color: theme.muted,
            letterSpacing: "0.08em",
            textAlign: "center",
          }}
        >
        </div>
      </div>
    </div>
  );
}
