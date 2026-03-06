import { LayoutDashboard, Timer, FolderKanban, Users, FileText, BarChart3, Settings, GitBranch } from "lucide-react";
import { NavLink, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { t } from "@/lib/i18n";

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

function NavItem({ item, end }: { item: typeof navigation[0]; end?: boolean }) {
  return (
    <NavLink to={item.href} end={end}
      className={({ isActive }) =>
        cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors w-full",
          isActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold" : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground")
      }>
      <item.icon className="h-[18px] w-[18px] shrink-0" />
      <span className="hidden lg:block">{t(item.key)}</span>
    </NavLink>
  );
}

export function Sidebar() {
  return (
    <>
      <aside className="hidden md:flex h-screen w-14 flex-col items-center bg-transparent py-5 lg:w-48 lg:items-start lg:px-3">
        <Link to="/" className="mb-8 flex items-center gap-2.5 px-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-xs">L</div>
          <span className="hidden text-base font-bold tracking-tight lg:block">Logr</span>
        </Link>
        <nav className="flex flex-1 flex-col gap-0.5 w-full">
          {navigation.map((item) => <NavItem key={item.key} item={item} end={item.href === "/app"} />)}
        </nav>
        <div className="w-full space-y-0.5">
          <NavItem item={{ key: "sidebar.settings", icon: Settings, href: "/app/settings" }} />
        </div>
      </aside>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-border bg-white py-2 px-1">
        {mobileNav.map((item) => (
          <NavLink key={item.key} to={item.href} end={item.href === "/app"}
            className={({ isActive }) => cn("flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-[10px] font-medium transition-colors", isActive ? "text-primary" : "text-muted-foreground")}>
            <item.icon className="h-5 w-5" />
            <span>{t(item.key)}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}
