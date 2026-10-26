import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import * as RadixDialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SessionEditDialog } from "@/components/shared/session-edit-dialog";
import { NAV } from "@/components/layout/app-rail";
import { useShell } from "@/components/layout/shell-context";
import { useAppData } from "@/contexts/data-context";
import { useTracker } from "@/contexts/tracker-context";
import { useT } from "@/i18n";
import { projectToneStyle } from "@/lib/project-tone";

/** A single, type-tagged result row in the palette. */
type Result =
  | { kind: "action"; id: string; label: string; hint: string; group: "Actions"; run: () => void }
  | { kind: "page"; id: string; label: string; group: "Pages" }
  | { kind: "project"; id: string; label: string; group: "Projects" }
  | { kind: "session"; id: string; label: string; sub: string; group: "Sessions"; projectId: string; name: string };

const CAP = 8;
const GROUP_KEYS: Record<Result["group"], string> = {
  Actions: "cmd.groupActions",
  Pages: "cmd.groupPages",
  Projects: "cmd.groupProjects",
  Sessions: "cmd.groupSessions",
};
const RECENT = 30;

/** ⌘K command palette — actions, pages, projects and recent sessions in one
 *  list. Keyboard-first: ↑/↓ to move, Enter to run, Esc to close. A session
 *  hit opens its quick-edit dialog; a project hit opens the filtered list. */
export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { sessions, projects, getProjectById } = useAppData();
  const tracker = useTracker();
  const shell = useShell();
  const t = useT();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [match, setMatch] = useState<{ projectId: string; name: string } | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Reset query + highlight on close (event-driven), so the next open is fresh.
  const close = () => {
    setQuery("");
    setActive(0);
    onClose();
  };

  const results = useMemo<Result[]>(() => {
    const q = query.trim().toLowerCase();
    const hit = (label: string) => !q || label.toLowerCase().includes(q);

    const actions: Result[] = [
      {
        kind: "action", id: "timer", group: "Actions", hint: "S",
        label: tracker.running ? t("track.stop") : t("track.start"),
        run: () => void tracker.toggle(),
      },
      { kind: "action", id: "entry", group: "Actions", hint: "N", label: t("cal.newEntry"), run: () => shell.openNewEntry() },
      { kind: "action", id: "panel", group: "Actions", hint: "\\", label: t("panel.toggle"), run: shell.togglePanel },
      { kind: "action", id: "keys", group: "Actions", hint: "?", label: t("keys.title"), run: () => shell.setShortcutsOpen(true) },
    ];
    const pages: Result[] = [...NAV, { href: "/app/settings", labelKey: "sidebar.settings" }].map((n) => ({
      kind: "page", id: n.href, label: t(n.labelKey), group: "Pages",
    }));

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

    return [...actions.filter((r) => hit(r.label)), ...pages.filter((r) => hit(r.label)), ...projectMatches, ...sessionMatches];
  }, [query, projects, sessions, getProjectById, t, tracker, shell]);

  // Clamp the highlight into bounds at render time (results shrink as you type).
  const activeIndex = results.length > 0 ? Math.min(active, results.length - 1) : 0;

  const activate = (r: Result) => {
    if (r.kind === "action") r.run();
    else if (r.kind === "page") router.push(r.id);
    else if (r.kind === "project") router.push(`/app/sessions?project=${encodeURIComponent(r.id)}`);
    else setMatch({ projectId: r.projectId, name: r.name });
    close(); // close palette; the edit dialog or the sessions page takes over
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
          <RadixDialog.Overlay className="app-portal fixed inset-0 z-40 bg-(--cal-overlay)" />
          <RadixDialog.Content
            aria-label={t("cmd.search")}
            onKeyDown={onKeyDown}
            className="app-portal fixed left-1/2 top-[18vh] z-50 w-full max-w-[560px] -translate-x-1/2 overflow-hidden rounded-xl border border-(--cal-raised-line) bg-popover shadow-dropdown focus:outline-none"
          >
            <RadixDialog.Title className="sr-only">{t("cmd.search")}</RadixDialog.Title>
            <div className="border-b border-line p-3">
              <Input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("cmd.searchPlaceholder")}
                variant="ghost"
                inputSize="lg"
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
                        {t(GROUP_KEYS[header])}
                      </div>
                    )}
                    <Button
                      type="button"
                      variant={i === activeIndex ? "secondary" : "ghost"}
                      size="lg"
                      data-index={i}
                      onMouseEnter={() => setActive(i)}
                      onClick={() => activate(r)}
                      className="w-full justify-start"
                    >
                      {r.kind === "project" ? (
                        <span aria-hidden="true" style={projectToneStyle(r.id)} className="size-2 shrink-0 rounded-full bg-(--bar)" />
                      ) : null}
                      <span className="truncate text-md font-medium text-heading">{r.label}</span>
                      {r.kind === "session" && (
                        <span className="truncate text-md-minus text-muted-foreground">{r.sub}</span>
                      )}
                      {r.kind === "action" && (
                        <kbd className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-[5px] border border-line bg-card px-1 font-sans text-[11px] text-tertiary">
                          {r.hint}
                        </kbd>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          </RadixDialog.Content>
        </RadixDialog.Portal>
      </RadixDialog.Root>

      {match && <SessionEditDialog open onClose={() => setMatch(null)} match={match} />}
    </>
  );
}
