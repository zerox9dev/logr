import {
  BarChart3,
  Clock3,
  FileText,
  LayoutDashboard,
  UserCircle2,
  Users,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const MENU_ITEMS = [
  { value: "dashboard", icon: LayoutDashboard, key: "sidebar.dashboard" },
  { value: "tracker", icon: Clock3, key: "sidebar.tracker" },
  { value: "clients", icon: Users, key: "sidebar.clients" },
  { value: "pipeline", icon: BarChart3, key: "sidebar.pipeline" },
  { value: "invoices", icon: FileText, key: "sidebar.invoices" },
];

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
    <ShadcnSidebar
      collapsible="none"
      className={`sidebar${mobileView === "clients" ? " mobile-open" : ""}`}
      style={{
        "--sidebar-width": "200px",
        "--sidebar": "#f6f7f9",
        "--sidebar-foreground": theme.tabInactive,
        "--sidebar-border": theme.border,
        borderRight: `1px solid ${theme.border}`,
        height: "100vh",
        position: "sticky",
        top: 0,
      }}
    >
      <SidebarContent className="gap-0 p-0" style={{ paddingTop: 32 }}>
        <div style={{ fontSize: 9, color: theme.muted, letterSpacing: "0.2em", padding: "0 20px", marginBottom: 8 }}>
          {t("sidebar.app")}
        </div>
        <div style={{ display: "grid", gap: 4, padding: "0 20px", marginBottom: 18 }}>
          <SidebarMenu className="gap-1">
            {MENU_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <SidebarMenuItem key={item.value}>
                  <SidebarMenuButton
                    isActive={screen === item.value}
                    onClick={() => onSelectScreen(item.value)}
                    data-tour={item.value === "tracker" ? "tracker-tab" : item.value === "clients" ? "clients-tab" : undefined}
                    className="h-auto rounded-none border text-[10px] uppercase"
                    style={{
                      borderColor: theme.border,
                      color: screen === item.value ? theme.tabActive : theme.tabInactive,
                      background: screen === item.value ? theme.tabActiveBg : "transparent",
                      padding: "6px 10px",
                      letterSpacing: "0.12em",
                    }}
                  >
                    <Icon size={14} />
                    <span>{t(item.key)}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </div>
      </SidebarContent>

      <SidebarFooter className="mt-auto gap-0 p-0" style={{ padding: "0 20px 32px" }}>
        <SidebarMenu className="gap-2">
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={screen === "profile"}
              onClick={() => onSelectScreen("profile")}
              className="h-auto rounded-none border text-[10px] uppercase"
              style={{
                borderColor: theme.border,
                color: screen === "profile" ? theme.tabActive : theme.muted,
                background: screen === "profile" ? theme.tabActiveBg : "transparent",
                padding: "6px 10px",
                marginBottom: 10,
                letterSpacing: "0.1em",
              }}
            >
              <UserCircle2 size={14} />
              <span>{t("sidebar.profile")}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={onToggleTheme}
              className="h-auto rounded-none border text-[10px] uppercase"
              style={{
                borderColor: theme.border,
                color: theme.muted,
                background: "transparent",
                padding: "6px 10px",
                letterSpacing: "0.1em",
              }}
            >
              <span>{dark ? t("sidebar.light") : t("sidebar.dark")}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={onOpenOnboarding}
              className="h-auto rounded-none border text-[10px] uppercase"
              style={{
                borderColor: theme.border,
                color: theme.muted,
                background: "transparent",
                padding: "6px 10px",
                marginTop: 10,
                letterSpacing: "0.1em",
              }}
            >
              <span>{t("sidebar.onboarding")}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <div className="mt-2 text-center text-[10px] tracking-[0.08em]" style={{ color: theme.muted }}>
          {t("sidebar.madeBy")}{" "}
          <a href="https://zerox9dev.com" target="_blank" rel="noreferrer" style={{ color: theme.muted, textDecoration: "underline" }}>
            zerox9dev
          </a>
        </div>
      </SidebarFooter>
    </ShadcnSidebar>
  );
}
