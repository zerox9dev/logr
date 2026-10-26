// Pure pieces of time tracking: turning a stretch of work into a session row,
// and summing tracked time per project for today and this week.

import { addDays, startOfDay, startOfWeek } from "@/lib/date";
import type { Project, Session, SessionInsert } from "@/types/database";

/** Build a SessionInsert from a project + task + timing, baking in the rate
 *  that applies at creation time so every later aggregation reads it straight
 *  off the session. The caller resolves the rate (salary, project, default). */
export function buildSession(
  project: Project | undefined,
  name: string,
  startedAtMs: number,
  durationSeconds: number,
  rate: number,
): Omit<SessionInsert, "user_id"> {
  return {
    client_id: project?.client_id ?? null,
    project_id: project?.id ?? null,
    name: name.trim() || "Untitled",
    notes: null,
    tags: [],
    started_at: new Date(startedAtMs).toISOString(),
    duration_seconds: durationSeconds,
    rate,
    billing_type: project?.billing_type ?? "hourly",
    payment_status: "unpaid",
  };
}

export interface Totals {
  today: number;
  week: number;
}

export interface TrackedTotals {
  /** Seconds per project id; sessions without a project are under "". */
  byProject: Map<string, Totals>;
  today: number;
  week: number;
  weekEarned: number;
}

/** What the running timer has on the clock, counted as if already saved. */
export interface LiveTimer {
  projectId: string | null;
  seconds: number;
  rate: number;
}

/**
 * Tracked seconds for today and the Monday-based week containing `now`, per
 * project and overall, plus the week's earnings. A session counts by its
 * start; the running timer counts at `now`.
 */
export function trackedTotals(
  sessions: Pick<Session, "project_id" | "started_at" | "duration_seconds" | "rate">[],
  now: Date,
  live?: LiveTimer,
): TrackedTotals {
  const dayStart = startOfDay(now).getTime();
  const dayEnd = addDays(startOfDay(now), 1).getTime();
  const weekStart = startOfWeek(now).getTime();
  const weekEnd = addDays(startOfWeek(now), 7).getTime();
  const out: TrackedTotals = { byProject: new Map(), today: 0, week: 0, weekEarned: 0 };

  const add = (projectId: string | null, at: number, seconds: number, rate: number) => {
    if (at < weekStart || at >= weekEnd) return;
    const key = projectId ?? "";
    const row = out.byProject.get(key) ?? { today: 0, week: 0 };
    row.week += seconds;
    out.week += seconds;
    out.weekEarned += (seconds / 3600) * rate;
    if (at >= dayStart && at < dayEnd) {
      row.today += seconds;
      out.today += seconds;
    }
    out.byProject.set(key, row);
  };

  for (const s of sessions) add(s.project_id, new Date(s.started_at).getTime(), s.duration_seconds, s.rate);
  if (live) add(live.projectId, now.getTime(), live.seconds, live.rate);
  return out;
}
