import { Timer, FolderKanban, Users, FileText, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Timer", icon: Timer, href: "/" },
  { name: "Projects", icon: FolderKanban, href: "/projects" },
  { name: "Clients", icon: Users, href: "/clients" },
  { name: "Invoices", icon: FileText, href: "/invoices" },
  { name: "Reports", icon: BarChart3, href: "/reports" },
];

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  return (
    <aside className="flex h-screen w-16 flex-col items-center border-r border-border bg-sidebar-background py-4 lg:w-56 lg:items-start lg:px-3">
      <div className="mb-8 flex items-center gap-2 px-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
          L
        </div>
        <span className="hidden text-lg font-bold text-foreground lg:block">Logr</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 w-full">
        {navigation.map((item) => (
          <button
            key={item.name}
            onClick={() => onNavigate(item.href)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium transition-colors w-full",
              currentPage === item.href
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            <span className="hidden lg:block">{item.name}</span>
          </button>
        ))}
      </nav>

      <button
        onClick={() => onNavigate("/settings")}
        className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors w-full"
      >
        <Settings className="h-5 w-5 shrink-0" />
        <span className="hidden lg:block">Settings</span>
      </button>
    </aside>
  );
}
