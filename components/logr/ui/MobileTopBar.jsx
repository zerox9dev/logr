import { useTranslation } from "react-i18next";

export default function MobileTopBar({ theme, activeClient, mobileView, screen, onToggle }) {
  const { t } = useTranslation();
  return (
    <div
      className="mobile-bar"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 99,
        background: theme.bg,
        borderBottom: `1px solid ${theme.border}`,
        padding: "12px 16px",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div style={{ fontFamily: "'Inter Tight',sans-serif", fontSize: 28, color: theme.timerColor, letterSpacing: "-0.01em" }}>
        LOGR
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {screen === "tracker" && activeClient ? <div style={{ fontSize: 11, color: theme.muted }}>{activeClient.name}</div> : null}
        <button
          onClick={onToggle}
          style={{
            background: "none",
            border: `1px solid ${theme.border}`,
            color: theme.muted,
            cursor: "pointer",
            padding: "5px 10px",
            fontFamily: "inherit",
            fontSize: 10,
            letterSpacing: "0.1em",
          }}
        >
          {mobileView === "clients" ? t("mobile.close") : t("mobile.menu")}
        </button>
      </div>
    </div>
  );
}
