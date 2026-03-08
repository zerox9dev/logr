import { LayoutDashboard, Timer, FolderKanban, Users, FileText, BarChart3, Settings, GitBranch } from "lucide-react";
import { NavLink, Link } from "react-router-dom";
import { t } from "@/lib/i18n";
import s from "./sidebar.module.css";

const navigation = [
  { key: "sidebar.dashboard", icon: LayoutDashboard, href: "/app" },
  { key: "sidebar.timer", icon: Timer, href: "/app/timer" },
  { key: "sidebar.projects", icon: FolderKanban, href: "/app/projects" },
  { key: "sidebar.clients", icon: Users, href: "/app/clients" },
  { key: "sidebar.invoices", icon: FileText, href: "/app/invoices" },
  { key: "sidebar.funnels", icon: GitBranch, href: "/app/funnels" },
  { key: "sidebar.reports", icon: BarChart3, href: "/app/reports" },
];

const mobileNav = [
  { key: "sidebar.dashboard", icon: LayoutDashboard, href: "/app" },
  { key: "sidebar.timer", icon: Timer, href: "/app/timer" },
  { key: "sidebar.projects", icon: FolderKanban, href: "/app/projects" },
  { key: "sidebar.invoices", icon: FileText, href: "/app/invoices" },
  { key: "sidebar.settings", icon: Settings, href: "/app/settings" },
];

function SidebarNavItem({ item, end }: { item: typeof navigation[0]; end?: boolean }) {
  return (
    <NavLink to={item.href} end={end}
      className={({ isActive }) =>
        [s.navLink, isActive ? s.navLinkActive : ""].filter(Boolean).join(" ")
      }>
      <item.icon className={s.navIcon} />
      <span className={s.navLabel}>{t(item.key)}</span>
    </NavLink>
  );
}

export function Sidebar() {
  return (
    <>
      <aside className={s.sidebar}>
        <Link to="/" className={s.logo}>
          <div className={s.logoIcon}>L</div>
          <span className={s.logoText}>Logr</span>
        </Link>
        <nav className={s.nav}>
          {navigation.map((item) => (
            <SidebarNavItem key={item.key} item={item} end={item.href === "/app"} />
          ))}
        </nav>
        <div className={s.navBottom}>
          <SidebarNavItem item={{ key: "sidebar.settings", icon: Settings, href: "/app/settings" }} />
        </div>
      </aside>
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
