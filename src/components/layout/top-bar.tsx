import { Search, Bell } from "lucide-react";
import { useLocation } from "react-router-dom";

const ROUTE_NAMES: Record<string, string> = {
  "/app": "Dashboard",
  "/app/timer": "Timer",
  "/app/projects": "Projects",
  "/app/clients": "Clients",
  "/app/invoices": "Invoices",
  "/app/invoices/new": "New Invoice",
  "/app/funnels": "Funnels",
  "/app/reports": "Reports",
  "/app/settings": "Settings",
};

export function TopBar({ userName }: { userName?: string }) {
  const location = useLocation();
  const currentPage = ROUTE_NAMES[location.pathname] || "Dashboard";
  const initials = userName
    ? userName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <header className="flex items-center justify-between border-b border-border bg-card px-6 py-3">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Logr</span>
        <span className="text-muted-foreground">/</span>
        <span className="font-medium text-foreground">{currentPage}</span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <button className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-accent transition-colors">
          <Search className="h-4 w-4" />
        </button>
        <button className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-accent transition-colors relative">
          <Bell className="h-4 w-4" />
        </button>
        <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-semibold">
          {initials}
        </div>
      </div>
    </header>
  );
}
