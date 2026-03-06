import { LayoutDashboard, Timer, FolderKanban, Users, FileText, BarChart3, Settings, GitBranch, LogOut, ChevronsLeft } from "lucide-react";
import { NavLink, Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/app" },
  { name: "Timer", icon: Timer, href: "/app/timer" },
  { name: "Projects", icon: FolderKanban, href: "/app/projects" },
  { name: "Clients", icon: Users, href: "/app/clients" },
  { name: "Invoices", icon: FileText, href: "/app/invoices" },
  { name: "Funnels", icon: GitBranch, href: "/app/funnels" },
  { name: "Reports", icon: BarChart3, href: "/app/reports" },
];

const mobileNav = [
  { name: "Home", icon: LayoutDashboard, href: "/app" },
  { name: "Timer", icon: Timer, href: "/app/timer" },
  { name: "Projects", icon: FolderKanban, href: "/app/projects" },
  { name: "Invoices", icon: FileText, href: "/app/invoices" },
  { name: "More", icon: Settings, href: "/app/settings" },
];

function NavItem({ item, end }: { item: typeof navigation[0]; end?: boolean }) {
  return (
    <NavLink
      to={item.href}
      end={end}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all w-full",
          isActive
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
        )
      }
    >
      {({ isActive }) => (
        <>
          <item.icon className={cn("h-[18px] w-[18px] shrink-0", isActive && "text-blue-600")} />
          <span className="hidden lg:block">{item.name}</span>
        </>
      )}
    </NavLink>
  );
}

export function Sidebar() {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex h-screen w-14 flex-col border-r border-sidebar-border bg-sidebar-background py-4 lg:w-52 lg:px-3">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 px-3 mb-6">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xs shrink-0">
            L
          </div>
          <span className="hidden text-[15px] font-bold tracking-tight lg:block">Logr</span>
        </Link>

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-0.5 w-full">
          {navigation.map((item) => (
            <NavItem key={item.name} item={item} end={item.href === "/app"} />
          ))}
        </nav>

        {/* Bottom */}
        <div className="w-full space-y-1">
          <div className="border-t border-dashed border-sidebar-border my-2" />
          <NavItem item={{ name: "Settings", icon: Settings, href: "/app/settings" }} />
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-border bg-card py-2 px-1">
        {mobileNav.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            end={item.href === "/app"}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-[10px] font-medium transition-colors",
                isActive ? "text-blue-600" : "text-muted-foreground"
              )
            }
          >
            <item.icon className="h-5 w-5" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}
