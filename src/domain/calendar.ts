// Pure geometry for the week calendar: which days are on screen, where a
// session sits on its day, and how overlapping sessions share the width.
// Minutes are local minutes since midnight throughout.

import { addDays, localDateStr, startOfDay, startOfWeek } from "@/lib/date";

export const MINUTES_PER_DAY = 24 * 60;
/** Grid granularity for creating, moving and resizing. */
export const SNAP_MINUTES = 15;

/** Days on screen: a full Monday week for 7, otherwise `count` days from the anchor. */
export function visibleDays(anchor: Date, count: number): Date[] {
  const first = count === 7 ? startOfWeek(anchor) : startOfDay(anchor);
  return Array.from({ length: count }, (_, i) => addDays(first, i));
}

/** Step the anchor by one screen in `direction` (−1 back, +1 forward). */
export function shiftAnchor(anchor: Date, count: number, direction: -1 | 1): Date {
  return addDays(anchor, count * direction);
}

/** Stable key for a local calendar day, "YYYY-MM-DD". */
export const dayKey = localDateStr;

export function snap(minutes: number, step = SNAP_MINUTES): number {
  return Math.round(minutes / step) * step;
}

export function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

/** A local date at `minutes` past the midnight of `day`. */
export function atMinutes(day: Date, minutes: number): Date {
  const d = startOfDay(day);
  d.setMinutes(minutes);
  return d;
}

export interface Span {
  id: string;
  /** Minutes past the day's midnight. */
  start: number;
  end: number;
}

/** Wall-clock minutes past midnight — what the grid's hour lines mean. */
function clockMinutes(ms: number): number {
  const d = new Date(ms);
  return d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60 + d.getMilliseconds() / 60000;
}

/**
 * The part of [startedAt, startedAt + seconds) that falls on `day`, or null.
 * A session that runs past midnight shows on both days, clipped to each; one
 * shorter than a minute is drawn as a minute so it can still be seen.
 * Positions are wall-clock, not elapsed time, so a session on a 23- or 25-hour
 * DST day still sits at the hour it started.
 */
export function spanOnDay(id: string, startedAt: Date, seconds: number, day: Date): Span | null {
  const dayStart = startOfDay(day).getTime();
  const dayEnd = addDays(startOfDay(day), 1).getTime();
  const from = startedAt.getTime();
  const to = from + Math.max(seconds, 60) * 1000;
  const lo = Math.max(from, dayStart);
  const hi = Math.min(to, dayEnd);
  if (hi <= lo) return null;
  const start = lo === dayStart ? 0 : clockMinutes(lo);
  const end = hi === dayEnd ? MINUTES_PER_DAY : clockMinutes(hi);
  // Wall-clock can step back inside the fall-back hour; never draw inverted.
  return { id, start, end: Math.max(end, start + 1) };
}

export interface Placed extends Span {
  /** Zero-based column inside the overlap cluster. */
  column: number;
  /** Columns the cluster is split into. */
  columns: number;
}

/**
 * Side-by-side layout for one day: spans that overlap share the width, each
 * in the leftmost column free at its start; a cluster's column count is the
 * widest it gets, so every member of one cluster lines up.
 */
export function layoutDay(spans: Span[]): Placed[] {
  const sorted = [...spans].sort((a, b) => a.start - b.start || b.end - a.end);
  const placed: Placed[] = [];
  let cluster: Placed[] = [];
  let clusterEnd = -Infinity;
  const columnEnds: number[] = [];

  const flush = () => {
    const columns = Math.max(1, ...cluster.map((p) => p.column + 1));
    for (const p of cluster) p.columns = columns;
    placed.push(...cluster);
    cluster = [];
    clusterEnd = -Infinity;
    columnEnds.length = 0;
  };

  for (const s of sorted) {
    // A span starting at or after everything open so far begins a new cluster.
    if (cluster.length && s.start >= clusterEnd) flush();
    let column = columnEnds.findIndex((end) => end <= s.start);
    if (column === -1) column = columnEnds.length;
    columnEnds[column] = s.end;
    cluster.push({ ...s, column, columns: 1 });
    clusterEnd = Math.max(clusterEnd, s.end);
  }
  if (cluster.length) flush();
  return placed;
}

/** Shortest session the grid will make or leave behind. */
export const MIN_SECONDS = SNAP_MINUTES * 60;

/**
 * A session's start after dragging it `dDays` columns and `dMin` minutes.
 * Days step on the calendar, not by 24h, so a drag across a DST change keeps
 * the wall-clock time the block was dropped at.
 */
export function movedStart(startedAt: Date, dDays: number, dMin: number): Date {
  const d = new Date(startedAt);
  d.setDate(d.getDate() + dDays);
  d.setMinutes(d.getMinutes() + dMin);
  return d;
}

/** A session's length after dragging its lower edge by `dMin` minutes. */
export function resizedSeconds(seconds: number, dMin: number): number {
  return Math.max(MIN_SECONDS, seconds + dMin * 60);
}

/**
 * The stretch a drag on empty grid asks for, in minutes past midnight. A
 * click without a drag asks for an hour; nothing runs past the end of the day.
 */
export function createRange(from: number, to: number, moved: boolean): { start: number; end: number } | null {
  const start = Math.min(from, to);
  const end = Math.min(MINUTES_PER_DAY, moved ? Math.max(from, to) : start + 60);
  return end - start >= SNAP_MINUTES ? { start, end } : null;
}

/** Seconds of [startedAt, startedAt + seconds) that fall inside [from, to). */
export function overlapSeconds(startedAt: Date, seconds: number, from: Date, to: Date): number {
  const lo = Math.max(startedAt.getTime(), from.getTime());
  const hi = Math.min(startedAt.getTime() + seconds * 1000, to.getTime());
  return Math.max(0, (hi - lo) / 1000);
}
