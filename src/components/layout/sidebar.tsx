import { LayoutDashboard, Timer, FolderKanban, Users, FileText, BarChart3, Settings, GitBranch, Bell } from "lucide-react";
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

const iconStripColors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4"];

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
        {/* Icon strip */}
        <div className={s.iconStrip}>
          <Link to="/" className={s.iconStripLogo}>L</Link>
          {iconStripColors.map((color, i) => (
            <div key={i} className={s.iconStripDot} style={{ background: color }} />
          ))}
        </div>

        {/* Nav panel */}
        <div className={s.navPanel}>
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

          <div className={s.userBlock}>
            <div className={s.userAvatar}>U</div>
            <div className={s.userInfo}>
              <span className={s.userName}>User</span>
              <span className={s.userEmail}>user@logr.work</span>
            </div>
          </div>
        </div>
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

export function TopBar() {
  return (
    <div className={s.topBar}>
      <div className={s.searchWrap}>
        <input type="text" placeholder="Search anything..." className={s.searchInput} />
        <span className={s.searchHint}>⌘F</span>
      </div>
      <div className={s.topBarRight}>
        <button className={s.bellBtn}>
          <Bell className={s.bellIcon} />
        </button>
        <Link to="/app/timer" className={s.addBtn}>
          + Add
        </Link>
      </div>
    </div>
  );
}
