import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, Timer, FolderKanban, Users, FileText, BarChart3, Settings, Search, GitBranch } from "lucide-react";
import s from "./command-palette.module.css";

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
      setSelected((idx) => Math.min(idx + 1, filtered.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected((idx) => Math.max(idx - 1, 0));
    }
    if (e.key === "Enter" && filtered[selected]) {
      handleSelect(filtered[selected].href);
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
            placeholder="Search pages..."
            className={s.searchInput}
          />
          <kbd className={s.kbd}>ESC</kbd>
        </div>
        <div className={s.results}>
          {filtered.length === 0 ? (
            <p className={s.noResults}>No results.</p>
          ) : (
            filtered.map((page, i) => (
              <button
                key={page.href}
                onClick={() => handleSelect(page.href)}
                onMouseEnter={() => setSelected(i)}
                className={[s.item, i === selected ? s.itemSelected : ""].filter(Boolean).join(" ")}
              >
                <page.icon className={s.itemIcon} />
                <span className={s.itemLabel}>{page.name}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
