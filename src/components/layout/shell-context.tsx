"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { ManualDialog } from "@/components/dashboard/manual-entry-dialog";
import { useAppData } from "@/contexts/data-context";
import { useTracker } from "@/contexts/tracker-context";
import { isTypingTarget } from "@/lib/keyboard";

/**
 * Shell-wide UI state: whether the projects panel is out, the one "new entry"
 * dialog every surface opens (the title bar, the calendar's drag-to-create,
 * the N key), and the shortcuts sheet.
 */

const PANEL_KEY = "logr.panel";
const PANEL_EVENT = "logr-panel-change";

function readPanel(): boolean {
  try {
    return localStorage.getItem(PANEL_KEY) !== "closed";
  } catch {
    return true;
  }
}

function subscribePanel(onChange: () => void) {
  window.addEventListener(PANEL_EVENT, onChange);
  return () => window.removeEventListener(PANEL_EVENT, onChange);
}

interface EntryDraft {
  start?: Date;
  seconds?: number;
  projectId?: string | null;
}

function useShellState() {
  const panelOpen = useSyncExternalStore(subscribePanel, readPanel, () => true);
  const setPanelOpen = useCallback((open: boolean) => {
    try {
      localStorage.setItem(PANEL_KEY, open ? "open" : "closed");
    } catch {
      // Private mode: the panel still toggles, it just won't be remembered.
    }
    window.dispatchEvent(new Event(PANEL_EVENT));
  }, []);
  const togglePanel = useCallback(() => setPanelOpen(!readPanel()), [setPanelOpen]);

  const [draft, setDraft] = useState<EntryDraft | null>(null);
  // Bumped per open so the dialog remounts and picks up the new defaults.
  const [draftKey, setDraftKey] = useState(0);
  const openNewEntry = useCallback((d: EntryDraft = {}) => {
    setDraft(d);
    setDraftKey((k) => k + 1);
  }, []);
  const closeNewEntry = useCallback(() => setDraft(null), []);

  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  return useMemo(
    () => ({
      panelOpen, setPanelOpen, togglePanel,
      draft, draftKey, openNewEntry, closeNewEntry,
      shortcutsOpen, setShortcutsOpen,
    }),
    [panelOpen, setPanelOpen, togglePanel, draft, draftKey, openNewEntry, closeNewEntry, shortcutsOpen],
  );
}

type Shell = ReturnType<typeof useShellState>;

const ShellContext = createContext<Shell | null>(null);

function NewEntryDialog({ shell }: { shell: Shell }) {
  const { projects } = useAppData();
  const tracker = useTracker();
  const { draft } = shell;
  return (
    <ManualDialog
      key={shell.draftKey}
      open={draft !== null}
      onClose={shell.closeNewEntry}
      projects={projects}
      defaultProjectId={draft?.projectId !== undefined ? draft.projectId : tracker.projectId}
      defaultStart={draft?.start}
      defaultSeconds={draft?.seconds}
      onSave={(pid, name, dateISO, seconds) => void tracker.logSession(pid, name, new Date(dateISO), seconds)}
    />
  );
}

export function ShellProvider({ children }: { children: ReactNode }) {
  const shell = useShellState();
  // Read through a ref so the key listener isn't re-bound on every timer tick.
  const { toggle } = useTracker();
  const toggleRef = useRef(toggle);
  useEffect(() => {
    toggleRef.current = toggle;
  });
  const { openNewEntry, togglePanel, setShortcutsOpen } = shell;

  // Shortcuts that work on every screen. View-specific ones live with the view.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || isTypingTarget(e.target)) return;
      if (e.key === "s") void toggleRef.current();
      else if (e.key === "n") openNewEntry();
      else if (e.key === "\\") togglePanel();
      else if (e.key === "?") setShortcutsOpen(true);
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openNewEntry, togglePanel, setShortcutsOpen]);

  return (
    <ShellContext.Provider value={shell}>
      {children}
      <NewEntryDialog shell={shell} />
    </ShellContext.Provider>
  );
}

export function useShell() {
  const ctx = useContext(ShellContext);
  if (!ctx) throw new Error("useShell must be inside ShellProvider");
  return ctx;
}
