import { useTranslation } from "react-i18next";

export default function WelcomeState({ theme }) {
  const { t } = useTranslation();
  return (
    <div style={{ marginTop: 60, maxWidth: 360 }}>
      <div style={{ fontFamily: "'Inter Tight',sans-serif", fontSize: 44, fontWeight: 400, color: theme.timerColor, letterSpacing: "-0.02em", marginBottom: 12, lineHeight: 1.05 }}>
        {t("welcome.title")}
      </div>
      <div style={{ fontSize: 12, color: theme.muted, lineHeight: 1.8, marginBottom: 32 }}>
        {t("welcome.subtitle")}
      </div>
      {[
        ["1", t("welcome.step1t"), t("welcome.step1d")],
        ["2", t("welcome.step2t"), t("welcome.step2d")],
        ["3", t("welcome.step3t"), t("welcome.step3d")],
        ["4", t("welcome.step4t"), t("welcome.step4d")],
      ].map(([n, title, desc]) => (
        <div key={n} style={{ display: "flex", gap: 16, marginBottom: 20, alignItems: "flex-start" }}>
          <div style={{ fontFamily: "'Inter Tight',sans-serif", fontSize: 26, color: theme.muted, minWidth: 20 }}>{n}</div>
          <div>
            <div style={{ fontSize: 12, color: theme.text, letterSpacing: "0.05em" }}>{title}</div>
            <div style={{ fontSize: 11, color: theme.muted, marginTop: 2 }}>{desc}</div>
          </div>
        </div>
      ))}
      <div style={{ fontSize: 10, color: theme.faint, letterSpacing: "0.15em", marginTop: 8 }}>{t("welcome.shortcut")}</div>
    </div>
  );
}
