// Suggesting a project for a new time entry from its description.
//
// Pure, dependency-free scoring so it can run instantly client-side (and be
// unit-tested) before we ever reach for the LLM fallback. Given the text the
// user is typing and their past sessions, we guess which project it belongs to
// by word overlap against historical session names, aggregated per project.

import type { Project, Session } from "@/types/database";

/** Minimal shape we need from a past session — keeps the function testable. */
export type SessionLike = Pick<Session, "name" | "project_id">;

export interface ProjectSuggestion {
  projectId: string;
  /** 0–1 — how confident the match is. Drives whether we fall back to the LLM. */
  confidence: number;
  source: "history" | "llm";
}

const STOPWORDS = new Set([
  "the", "and", "for", "with", "from", "this", "that", "into", "your", "our",
  "a", "an", "of", "to", "on", "in", "at", "is", "it", "be", "by", "or",
]);

/** Lowercase word tokens, length ≥ 2, stopwords dropped. */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/i)
    .filter((w) => w.length >= 2 && !STOPWORDS.has(w));
}

/**
 * Best-guess project for `text`, scored against past session names.
 *
 * Returns `null` when there's nothing to go on (no text, no labelled history,
 * or no match clears the confidence floor). A caller treats a low/absent result
 * as a cue to ask the LLM instead.
 */
export function suggestFromHistory(
  text: string,
  sessions: SessionLike[],
  projects: Pick<Project, "id">[],
): ProjectSuggestion | null {
  const input = tokenize(text);
  if (input.length === 0) return null;

  const inputSet = new Set(input);
  const liveProjects = new Set(projects.map((p) => p.id));

  // Per project, track the strongest single name match (coverage of the typed
  // words) and how many past sessions matched at all (a recurring task is a
  // stronger signal than a one-off).
  const byProject = new Map<string, { best: number; hits: number }>();

  for (const s of sessions) {
    if (!s.project_id || !liveProjects.has(s.project_id)) continue;
    const nameSet = new Set(tokenize(s.name));
    if (nameSet.size === 0) continue;

    let overlap = 0;
    for (const w of inputSet) if (nameSet.has(w)) overlap++;
    if (overlap === 0) continue;

    const coverage = overlap / inputSet.size; // 0–1
    const acc = byProject.get(s.project_id) ?? { best: 0, hits: 0 };
    acc.best = Math.max(acc.best, coverage);
    acc.hits += 1;
    byProject.set(s.project_id, acc);
  }

  if (byProject.size === 0) return null;

  // Rank by coverage, then by a small recurrence bonus.
  let top: { projectId: string; score: number } | null = null;
  let runnerUp = 0;
  for (const [projectId, { best, hits }] of byProject) {
    const score = Math.min(1, best + Math.min(0.15, (hits - 1) * 0.05));
    if (!top || score > top.score) {
      runnerUp = top?.score ?? 0;
      top = { projectId, score };
    } else if (score > runnerUp) {
      runnerUp = score;
    }
  }
  if (!top) return null;

  // Require a real signal and a margin over the second-best project, so we
  // don't confidently pick between two equally-plausible projects.
  if (top.score < 0.34 || top.score - runnerUp < 0.1) return null;

  return { projectId: top.projectId, confidence: top.score, source: "history" };
}
