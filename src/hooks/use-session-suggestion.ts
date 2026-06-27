import { useEffect, useState } from "react";
import { useAppData } from "@/contexts/data-context";
import { suggestFromHistory, type ProjectSuggestion } from "@/domain/suggest-session";

// Inline project suggestion for the tracking card. Debounces the description,
// tries the local history heuristic first, and only calls the LLM route when
// that's inconclusive. Returns the suggested project (when it differs from the
// current selection) plus a one-call dismiss.

const DEBOUNCE_MS = 450;
/** Above this, the local match is good enough — skip the LLM. */
const HISTORY_CONFIDENT = 0.6;
/** Below this, ignore the suggestion entirely (too weak to surface). */
const SHOW_FLOOR = 0.4;

export interface ResolvedSuggestion {
  projectId: string;
  projectName: string;
  source: ProjectSuggestion["source"];
}

export function useSessionSuggestion(
  text: string,
  currentProjectId: string | null,
): { suggestion: ResolvedSuggestion | null; dismiss: () => void } {
  const { sessions, projects, getProjectById } = useAppData();
  const [raw, setRaw] = useState<ProjectSuggestion | null>(null);
  const [dismissed, setDismissed] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      const trimmed = text.trim();
      if (trimmed.length < 3) {
        setRaw(null);
        return;
      }
      const local = suggestFromHistory(trimmed, sessions, projects);
      if (local && local.confidence >= HISTORY_CONFIDENT) {
        if (!cancelled) setRaw(local);
        return;
      }

      // Inconclusive locally — ask the LLM (no-ops to null without an API key).
      try {
        const res = await fetch("/api/suggest", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            text: trimmed,
            projects: projects.map((p) => ({ id: p.id, name: p.name })),
            recentNames: sessions.slice(0, 20).map((s) => s.name),
          }),
        });
        if (!res.ok) {
          if (!cancelled) setRaw(local);
          return;
        }
        const data: { suggestion: ProjectSuggestion | null } = await res.json();
        if (!cancelled) setRaw(data.suggestion ?? local);
      } catch {
        if (!cancelled) setRaw(local);
      }
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [text, sessions, projects]);

  // Resolve to a surfaceable suggestion: strong enough, not the current
  // project, not dismissed, and the project still exists.
  let suggestion: ResolvedSuggestion | null = null;
  if (
    raw &&
    raw.confidence >= SHOW_FLOOR &&
    raw.projectId !== currentProjectId &&
    raw.projectId !== dismissed
  ) {
    const project = getProjectById(raw.projectId);
    if (project) {
      suggestion = { projectId: project.id, projectName: project.name, source: raw.source };
    }
  }

  return { suggestion, dismiss: () => setDismissed(raw?.projectId ?? null) };
}
