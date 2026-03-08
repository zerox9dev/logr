import { LayoutDashboard, Timer, FolderKanban, Users, FileText, BarChart3, Settings, GitBranch } from "lucide-react";
import { NavLink, Link } from "react-router-dom";
import { t } from "@/lib/i18n";
import { useAppData } from "@/lib/data-context";
import s from "./sidebar.module.css";

const mainNav = [
  { key: "sidebar.dashboard", icon: LayoutDashboard, href: "/app" },
  { key: "sidebar.timer", icon: Timer, href: "/app/timer" },
  { key: "sidebar.projects", icon: FolderKanban, href: "/app/projects" },
  { key: "sidebar.clients", icon: Users, href: "/app/clients" },
  { key: "sidebar.invoices", icon: FileText, href: "/app/invoices" },
  { key: "sidebar.funnels", icon: GitBranch, href: "/app/funnels" },
];

const resourcesNav = [
  { key: "sidebar.reports", icon: BarChart3, href: "/app/reports" },
];

const systemNav = [
  { key: "sidebar.settings", icon: Settings, href: "/app/settings" },
];

const mobileNav = [
  { key: "sidebar.dashboard", icon: LayoutDashboard, href: "/app" },
  { key: "sidebar.timer", icon: Timer, href: "/app/timer" },
  { key: "sidebar.projects", icon: FolderKanban, href: "/app/projects" },
  { key: "sidebar.invoices", icon: FileText, href: "/app/invoices" },
  { key: "sidebar.settings", icon: Settings, href: "/app/settings" },
];

function SidebarNavItem({ item, end, badge }: { item: typeof mainNav[0]; end?: boolean; badge?: number }) {
  return (
    <NavLink to={item.href} end={end}
      className={({ isActive }) =>
        [s.navLink, isActive ? s.navLinkActive : ""].filter(Boolean).join(" ")
      }>
      <item.icon className={s.navIcon} />
      <span className={s.navLabel}>{t(item.key)}</span>
      {badge !== undefined && badge > 0 && <span className={s.navBadge}>{badge}</span>}
    </NavLink>
  );
}

export function Sidebar() {
  const { projects, clients, invoices } = useAppData();

  const badgeMap: Record<string, number> = {
    "sidebar.projects": projects.length,
    "sidebar.clients": clients.length,
    "sidebar.invoices": invoices.length,
  };

  return (
    <>
      <aside className={s.sidebar}>
        <Link to="/" className={s.logo}>
          <div className={s.logoIcon}>L</div>
          <span className={s.logoText}>Logr</span>
        </Link>

        <nav className={s.nav}>
          <div className={s.navSection}>
            <span className={s.navSectionLabel}>MAIN MENU</span>
            {mainNav.map((item) => (
              <SidebarNavItem key={item.key} item={item} end={item.href === "/app"} badge={badgeMap[item.key]} />
            ))}
          </div>
          <div className={s.navSection}>
            <span className={s.navSectionLabel}>RESOURCES</span>
            {resourcesNav.map((item) => (
              <SidebarNavItem key={item.key} item={item} />
            ))}
          </div>
          <div className={s.navSection}>
            <span className={s.navSectionLabel}>SYSTEM</span>
            {systemNav.map((item) => (
              <SidebarNavItem key={item.key} item={item} />
            ))}
          </div>
        </nav>
      </aside>

      {/* Mobile bottom tab bar */}
      <nav className={s.mobileNav}>
        {mobileNav.map((item) => (
          <NavLink key={item.key} to={item.href} end={item.href === "/app"}
            className={({ isActive }) =>
              [s.mobileLink, isActive ? s.mobileLinkActive : ""].filter(Boolean).join(" ")
            }>
            <item.icon className={s.mobileIcon} />
            <span>{t(item.key)}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}
