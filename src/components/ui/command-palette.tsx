import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, Timer, FolderKanban, Users, FileText, BarChart3, Settings, Search, GitBranch, Clock } from "lucide-react";
import { useAppData } from "@/lib/data-context";
import s from "./command-palette.module.css";

const pages = [
  { name: "Dashboard", href: "/app", icon: LayoutDashboard, keywords: "home overview", type: "page" },
  { name: "Timer", href: "/app/timer", icon: Timer, keywords: "track time start", type: "page" },
  { name: "Projects", href: "/app/projects", icon: FolderKanban, keywords: "project manage", type: "page" },
  { name: "Clients", href: "/app/clients", icon: Users, keywords: "client customer", type: "page" },
  { name: "Invoices", href: "/app/invoices", icon: FileText, keywords: "invoice bill payment", type: "page" },
  { name: "Funnels", href: "/app/funnels", icon: GitBranch, keywords: "funnel pipeline deal lead job search kanban", type: "page" },
  { name: "Reports", href: "/app/reports", icon: BarChart3, keywords: "report analytics stats", type: "page" },
  { name: "Settings", href: "/app/settings", icon: Settings, keywords: "settings preferences profile", type: "page" },
];

export function CommandPalette() {
  const { projects, clients, sessions } = useAppData();
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

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return pages;

    const filteredPages = pages.filter((p) => p.name.toLowerCase().includes(q) || p.keywords.includes(q));

    const filteredProjects = projects
      .filter((p) => p.name.toLowerCase().includes(q))
      .map((p) => ({ name: p.name, href: `/app/projects/${p.id}`, icon: FolderKanban, type: "project" }));

    const filteredClients = clients
      .filter((c) => c.name.toLowerCase().includes(q) || c.company?.toLowerCase().includes(q))
      .map((c) => ({ name: c.name, href: `/app/clients`, icon: Users, type: "client" }));

    const filteredSessions = sessions
      .filter((s) => s.name?.toLowerCase().includes(q))
      .slice(0, 5)
      .map((s) => ({ name: s.name, href: `/app/timer`, icon: Clock, type: "session" }));

    return [...filteredPages, ...filteredProjects, ...filteredClients, ...filteredSessions];
  }, [query, projects, clients, sessions]);

  const handleSelect = (href: string) => {
    navigate(href);
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected((idx) => Math.min(idx + 1, results.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected((idx) => Math.max(idx - 1, 0));
    }
    if (e.key === "Enter" && results[selected]) {
      handleSelect(results[selected].href);
    }
  };

  if (!open) return null;

  return (
    <div className={s.overlay}>
      <div className={s.backdrop} onClick={() => setOpen(false)} />
      <div className={s.panel}>
        <div className={s.searchBar}>
          <Search className={s.searchIcon} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelected(0); }}
            onKeyDown={handleKeyDown}
            placeholder="Search everything..."
            className={s.searchInput}
          />
          <kbd className={s.kbd}>ESC</kbd>
        </div>
        <div className={s.results}>
          {results.length === 0 ? (
            <p className={s.noResults}>No results for "{query}"</p>
          ) : (
            results.map((item, i) => (
              <button
                key={`${item.type}-${item.href}-${i}`}
                onClick={() => handleSelect(item.href)}
                onMouseEnter={() => setSelected(i)}
                className={[s.item, i === selected ? s.itemSelected : ""].filter(Boolean).join(" ")}
              >
                <item.icon className={s.itemIcon} />
                <div className={s.itemBody}>
                  <span className={s.itemLabel}>{item.name}</span>
                  {item.type !== "page" && <span className={s.itemType}>{item.type}</span>}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
