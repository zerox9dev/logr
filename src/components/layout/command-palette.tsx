import { useEffect, useMemo, useRef, useState } from "react";
import * as RadixDialog from "@radix-ui/react-dialog";
import { Input } from "@/components/ui/input";
import { SessionsDialog } from "@/components/shared/sessions-dialog";
import { useAppData } from "@/contexts/data-context";
import { useT } from "@/i18n";

/** A single, type-tagged result row in the palette. */
type Result =
  | { kind: "project"; id: string; label: string; group: "Projects" }
  | { kind: "session"; id: string; label: string; sub: string; group: "Sessions"; projectId: string; name: string };

const CAP = 8;
const RECENT = 30;

/** ⌘K command palette — fuzzy(ish) search over projects + recent sessions.
 *  Keyboard-first: ↑/↓ to move, Enter to open, Esc to close. Activating a
 *  result opens a SessionsDialog filtered to that project / task. */
export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { sessions, projects, getProjectById } = useAppData();
  const t = useT();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [match, setMatch] = useState<{ projectId?: string; name?: string } | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Reset query + highlight on close (event-driven), so the next open is fresh.
  const close = () => {
    setQuery("");
    setActive(0);
    onClose();
  };

  const results = useMemo<Result[]>(() => {
    const q = query.trim().toLowerCase();

    const projectMatches = projects
      .filter((p) => (q ? p.name.toLowerCase().includes(q) : true))
      .slice(0, q ? projects.length : CAP)
      .map<Result>((p) => ({ kind: "project", id: p.id, label: p.name, group: "Projects" }));

    const sessionPool = q ? sessions : sessions.slice(0, RECENT);
    const sessionMatches = sessionPool
      .filter((s) => {
        if (!q) return true;
        const projectName = getProjectById(s.project_id)?.name ?? "";
        return s.name.toLowerCase().includes(q) || projectName.toLowerCase().includes(q);
      })
      .slice(0, q ? sessions.length : CAP)
      .map<Result>((s) => ({
        kind: "session",
        id: s.id,
        label: s.name,
        sub: getProjectById(s.project_id)?.name ?? t("cmd.noProject"),
        group: "Sessions",
        projectId: s.project_id ?? "none",
        name: s.name,
      }));

    return [...projectMatches, ...sessionMatches];
  }, [query, projects, sessions, getProjectById, t]);

  // Clamp the highlight into bounds at render time (results shrink as you type).
  const activeIndex = results.length > 0 ? Math.min(active, results.length - 1) : 0;

  const activate = (r: Result) => {
    if (r.kind === "project") setMatch({ projectId: r.id });
    else setMatch({ projectId: r.projectId, name: r.name });
    close(); // close palette; SessionsDialog takes over
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const r = results[activeIndex];
      if (r) activate(r);
    }
  };

  // Scroll the active row into view.
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  // Render group headers inline by tracking the previous group.
  let lastGroup: string | null = null;

  return (
    <>
      <RadixDialog.Root open={open} onOpenChange={(o) => { if (!o) close(); }}>
        <RadixDialog.Portal>
          <RadixDialog.Overlay className="fixed inset-0 z-40 bg-black/35" />
          <RadixDialog.Content
            aria-label={t("cmd.search")}
            onKeyDown={onKeyDown}
            className="fixed left-1/2 top-[18vh] z-50 w-full max-w-[560px] -translate-x-1/2 border border-line bg-card shadow-[0px_8px_30px_0px_rgba(0,0,0,0.12)] focus:outline-none"
          >
            <RadixDialog.Title className="sr-only">{t("cmd.search")}</RadixDialog.Title>
            <div className="border-b border-line p-3">
              <Input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("cmd.searchPlaceholder")}
                className="h-10 border-0 px-1 text-base focus-visible:border-0"
              />
            </div>

            <div ref={listRef} className="flex max-h-[50vh] flex-col overflow-auto p-1.5">
              {results.length === 0 && (
                <span className="px-3 py-6 text-center text-md text-muted-foreground">{t("cmd.noResults")}</span>
              )}
              {results.map((r, i) => {
                const header = r.group !== lastGroup ? r.group : null;
                lastGroup = r.group;
                return (
                  <div key={`${r.kind}-${r.id}`}>
                    {header && (
                      <div className="px-3 pb-1 pt-2 text-sm-minus font-medium uppercase tracking-wide text-muted-foreground">
                        {header === "Projects" ? t("cmd.groupProjects") : t("cmd.groupSessions")}
                      </div>
                    )}
                    <button
                      type="button"
                      data-index={i}
                      onMouseEnter={() => setActive(i)}
                      onClick={() => activate(r)}
                      className={`flex w-full items-baseline gap-2 px-3 py-2 text-left ${i === activeIndex ? "bg-wash" : ""}`}
                    >
                      <span className="truncate text-md font-medium text-heading">{r.label}</span>
                      {r.kind === "session" && (
                        <span className="truncate text-md-minus text-muted-foreground">{r.sub}</span>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </RadixDialog.Content>
        </RadixDialog.Portal>
      </RadixDialog.Root>

      {match && <SessionsDialog open onClose={() => setMatch(null)} match={match} />}
    </>
  );
}
