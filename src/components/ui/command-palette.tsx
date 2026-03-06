import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, Timer, FolderKanban, Users, FileText, BarChart3, Settings, Search, GitBranch } from "lucide-react";

const pages = [
  { name: "Dashboard", href: "/app", icon: LayoutDashboard, keywords: "home overview" },
  { name: "Timer", href: "/app/timer", icon: Timer, keywords: "track time start" },
  { name: "Projects", href: "/app/projects", icon: FolderKanban, keywords: "project manage" },
  { name: "Clients", href: "/app/clients", icon: Users, keywords: "client customer" },
  { name: "Invoices", href: "/app/invoices", icon: FileText, keywords: "invoice bill payment" },
  { name: "Funnels", href: "/app/funnels", icon: GitBranch, keywords: "funnel pipeline deal lead job search kanban" },
  { name: "Reports", href: "/app/reports", icon: BarChart3, keywords: "report analytics stats" },
  { name: "Settings", href: "/app/settings", icon: Settings, keywords: "settings preferences profile" },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
        setQuery("");
        setSelected(0);
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const filtered = pages.filter((p) => {
    const q = query.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.keywords.includes(q);
  });

  const handleSelect = (href: string) => {
    navigate(href);
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected((s) => Math.min(s + 1, filtered.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected((s) => Math.max(s - 1, 0));
    }
    if (e.key === "Enter" && filtered[selected]) {
      handleSelect(filtered[selected].href);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      <div className="fixed inset-0 bg-black/50" onClick={() => setOpen(false)} />
      <div className="relative w-full max-w-md rounded-xl border border-border bg-background overflow-hidden">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelected(0); }}
            onKeyDown={handleKeyDown}
            placeholder="Search pages..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="text-[10px] text-muted-foreground border border-border rounded px-1.5 py-0.5">ESC</kbd>
        </div>
        <div className="max-h-64 overflow-auto py-2">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No results.</p>
          ) : (
            filtered.map((page, i) => (
              <button
                key={page.href}
                onClick={() => handleSelect(page.href)}
                onMouseEnter={() => setSelected(i)}
                className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm transition-colors ${
                  i === selected ? "bg-accent text-accent-foreground" : "text-foreground"
                }`}
              >
                <page.icon className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{page.name}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
