import type {
  Session, Project, Client, Invoice, Activity, UserSettings,
} from "@/types/database";
import {
  type Range, startOfDay, startOfWeek, startOfMonth, addDays, inRange,
} from "@/lib/date";
import { fmtDuration, fmtDurationCompact, fmtDurationFull, fmtMoney, fmtDateLong, pad2 } from "@/lib/format";
import { dashboard } from "@/i18n/dashboard";

// ── Period ──

export type Period = "Day" | "Week" | "Month" | "All";

/** Inclusive-start, exclusive-end range for the period containing `now`. */
export function rangeFor(period: Period, now: Date): Range {
  if (period === "Day") return { start: startOfDay(now), end: addDays(startOfDay(now), 1) };
  if (period === "Week") return { start: startOfWeek(now), end: addDays(startOfWeek(now), 7) };
  if (period === "Month") return { start: startOfMonth(now), end: new Date(now.getFullYear(), now.getMonth() + 1, 1) };
  return { start: new Date(0), end: addDays(startOfDay(now), 1) }; // All time → everything up to end of today
}

/** Move a reference date by one period step. "All" is not movable. */
export function shiftDate(date: Date, period: Period, dir: -1 | 1): Date {
  const d = new Date(date);
  if (period === "Day") d.setDate(d.getDate() + dir);
  else if (period === "Week") d.setDate(d.getDate() + dir * 7);
  else if (period === "Month") d.setMonth(d.getMonth() + dir);
  return d;
}

/** True when the reference period already covers today (can't page forward). */
export function isAtCurrentPeriod(period: Period, ref: Date, today: Date): boolean {
  if (period === "All") return true;
  return rangeFor(period, ref).start.getTime() >= rangeFor(period, today).start.getTime();
}

/** Resolves an i18n key. Provided by the app; defaults to English below. */
type TR = (key: string) => string;

const PERIOD_LEAD: Record<Period, string> = {
  Day: "metric.leadToday", Week: "metric.leadWeek", Month: "metric.leadMonth", All: "metric.leadAll",
};

// ── Input bundle ──

export interface MetricsInput {
  sessions: Session[];
  projects: Project[];
  clients: Client[];
  invoices: Invoice[];
  activities: Activity[];
  settings: UserSettings | null;
  now: Date;   // reference date (movable via date-nav)
  period: Period;
  t?: (key: string) => string; // app translator; omitted → English
  lang?: string;               // BCP-47 locale for dates/numbers; omitted → en-US
}

// ── View models ──

export interface HeaderView {
  dateLabel: string;
}

export interface TrackingView {
  rate: number;
  rateLabel: string;
  earnedLabel: string;
}

export interface ProjectTask {
  name: string;
  timeLabel: string;
}

export interface ProjectStat {
  id: string;
  name: string;
  pctLabel: string;
  timeLabel: string;
  fillPx: number;
  active: boolean;
  tasks: ProjectTask[];
}

export interface ProjectsView {
  rows: ProjectStat[];
  empty: boolean;
}

export interface ClientStat {
  /** Real client id from the DB; undefined for the pseudo "internal" row. */
  id?: string;
  name: string;
  rateLabel?: string;
  timeLabel: string;
  amountLabel: string;
  dot: string;
  internal: boolean;
}

export interface BillableView {
  billableTimeLabel: string;
  billableEarnedLabel: string;
  nonBillableTimeLabel: string;
  billablePct: number;
  nonBillablePct: number;
  pctLabel: string;
  nonBillablePctLabel: string;
  clients: ClientStat[];
  invoicedLabel: string;
}

export interface DonutStat {
  pct: number;
  label: string;
}

export interface DailyView {
  sentence: { lead: string; time: string; tasks: string; projects: string };
  totalTimeLabel: string;
  percentOfDay: number;
  dayBaseLabel: string;
  donuts: { focus: number; meetings: number; breaks: number; other: number };
}

export interface HeatmapDay {
  level: number;
  /** Tooltip text, e.g. "Mar 5 · 2 hr 30 min" or "Mar 5 · No activity". */
  title: string;
}

export interface HeatmapView {
  weeks: HeatmapDay[][]; // [week][day]
  months: string[];
  totalHoursLabel: string;
}

/** One weekday column of the "This week" bar chart. `heightPct` is 0..1 of the
 *  tallest day; days with no time still render a stub. */
export interface GoalDayBar {
  label: string;
  heightPct: number;
  empty: boolean;
}

export interface GoalsView {
  weeklyPct: number;
  weeklyLabel: string;
  currentStreak: number;
  longestStreak: number;
  week: GoalDayBar[];
}

export type TimelineCategory = "focus" | "meetings" | "breaks";

/** A session laid onto the 09:00–20:00 strip, as percentages of its width. */
export interface TimelineSegment {
  leftPct: number;
  widthPct: number;
  category: TimelineCategory;
}

/** An axis tick and where it sits on the same strip. */
export interface TimelineTick {
  label: string;
  leftPct: number;
}

export interface TimelineView {
  segments: TimelineSegment[];
  ticks: TimelineTick[];
  /** Compact per-category totals for the legend, e.g. "5h 41m". */
  legend: Record<TimelineCategory, string>;
  empty: boolean;
  /** Number of sessions that fell outside the 9:00–20:00 axis. */
  outsideRangeCount: number;
}

export interface DashboardMetrics {
  header: HeaderView;
  tracking: TrackingView;
  projects: ProjectsView;
  billable: BillableView;
  daily: DailyView;
  heatmap: HeatmapView;
  goals: GoalsView;
  timeline: TimelineView;
}

// ── Helpers ──

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
const earned = (s: Session) => (s.duration_seconds / 3600) * (s.rate || 0);
const isBillable = (s: Session) => (s.rate || 0) > 0;

function sumBy<T>(items: T[], fn: (t: T) => number): number {
  return items.reduce((acc, t) => acc + fn(t), 0);
}

// ── Per-widget derivations ──

function projectsView(sessions: Session[], projects: Project[]): ProjectsView {
  if (sessions.length === 0) return { rows: [], empty: true };
  const grand = sumBy(sessions, (s) => s.duration_seconds) || 1;

  const byProject = new Map<string, Session[]>();
  for (const s of sessions) {
    const key = s.project_id ?? "none";
    (byProject.get(key) ?? byProject.set(key, []).get(key)!).push(s);
  }

  const stats = [...byProject.entries()].map(([id, group]) => {
    const seconds = sumBy(group, (s) => s.duration_seconds);
    const project = projects.find((p) => p.id === id);
    // Tasks = sessions grouped by name within the project.
    const byName = new Map<string, number>();
    for (const s of group) byName.set(s.name, (byName.get(s.name) ?? 0) + s.duration_seconds);
    const tasks = [...byName.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, sec]) => ({ name, timeLabel: fmtDuration(sec) }));
    return { id, name: project?.name ?? "No project", seconds, tasks };
  }).sort((a, b) => b.seconds - a.seconds);

  const maxSec = stats[0]?.seconds || 1;
  const rows: ProjectStat[] = stats.map((st, i) => ({
    id: st.id,
    name: st.name,
    pctLabel: `${Math.round((st.seconds / grand) * 100)}%`,
    timeLabel: fmtDuration(st.seconds),
    fillPx: Math.round((st.seconds / maxSec) * 95),
    active: i === 0,
    tasks: st.tasks,
  }));
  return { rows, empty: false };
}

function billableView(sessions: Session[], clients: Client[], invoices: Invoice[], now: Date, tr: TR, period: Period, currency: string): BillableView {
  const units = { hr: tr("unit.hr"), min: tr("unit.min") };
  const billable = sessions.filter(isBillable);
  const nonBillable = sessions.filter((s) => !isBillable(s));
  const billSec = sumBy(billable, (s) => s.duration_seconds);
  const nonSec = sumBy(nonBillable, (s) => s.duration_seconds);
  const tracked = billSec + nonSec;
  // With nothing tracked both halves read 0%, which is what puts the split bar
  // into its neutral single-tone state instead of showing 100% non-billable.
  const billPct = tracked > 0 ? Math.round((billSec / tracked) * 100) : 0;
  const nonBillPct = tracked > 0 ? 100 - billPct : 0;

  // By client (billable only), grouped.
  const byClient = new Map<string, Session[]>();
  for (const s of billable) {
    const key = s.client_id ?? "none";
    (byClient.get(key) ?? byClient.set(key, []).get(key)!).push(s);
  }
  const clientRows: ClientStat[] = [...byClient.entries()]
    .map(([id, group]) => ({ id, group, amount: sumBy(group, earned) }))
    .sort((a, b) => b.amount - a.amount)
    .map(({ id, group, amount }) => {
      const rate = group.find((s) => s.rate)?.rate ?? 0;
      const client = clients.find((c) => c.id === id);
      return {
        id: client?.id,
        name: client?.name ?? tr("metric.noClient"),
        rateLabel: rate ? `$${rate}${tr("unit.perHr")}` : undefined,
        timeLabel: fmtDuration(sumBy(group, (s) => s.duration_seconds), units),
        amountLabel: fmtMoney(amount, currency),
        dot: "var(--color-brand-ink)",
        internal: false,
      };
    });

  if (nonSec > 0) {
    clientRows.push({
      name: tr("metric.internal"),
      timeLabel: fmtDuration(nonSec, units),
      amountLabel: "—",
      dot: "var(--color-placeholder)",
      internal: true,
    });
  }

  // Invoiced within the active period (matches the rest of the widget).
  const range = rangeFor(period, now);
  const invoiced = sumBy(
    invoices.filter((i) => i.status !== "draft" && inRange(i.created_at, range)),
    (i) => i.total,
  );

  return {
    billableTimeLabel: fmtDurationFull(billSec, units),
    billableEarnedLabel: `${fmtMoney(sumBy(billable, earned), currency)} ${tr("metric.earned")}`,
    nonBillableTimeLabel: fmtDurationFull(nonSec, units),
    billablePct: billPct,
    nonBillablePct: nonBillPct,
    pctLabel: `${billPct}% ${tr("metric.ofTrackedTime")}`,
    nonBillablePctLabel: `${nonBillPct}%`,
    clients: clientRows,
    invoicedLabel: fmtMoney(invoiced, currency),
  };
}

function dailyView(sessions: Session[], activities: Activity[], period: Period, tr: TR, settings?: UserSettings | null): DailyView {
  const units = { hr: tr("unit.hr"), min: tr("unit.min") };
  const totalSec = sumBy(sessions, (s) => s.duration_seconds);
  // "All" has no fixed window — measure against a per-day target for each tracked day.
  const trackedDays = new Set(sessions.map((s) => dayKey(new Date(s.started_at)))).size;
  const weeklyGoal = (settings?.weekly_goal_hours && settings.weekly_goal_hours > 0) ? settings.weekly_goal_hours : 40;
  const perDay = weeklyGoal / 5;
  const baseHours =
    period === "Day" ? perDay : period === "Week" ? weeklyGoal : period === "Month" ? weeklyGoal * 4 : Math.max(perDay, trackedDays * perDay);
  const percentOfDay = Math.min(100, Math.round((totalSec / (baseHours * 3600)) * 100));

  const projectCount = new Set(sessions.map((s) => s.project_id).filter(Boolean)).size;

  // Donuts: sessions tagged "Meeting" count as meetings, not focus.
  const isMeetingSession = (s: Session) => (s.tags ?? []).some((t) => t.toLowerCase() === "meeting");
  const meetingSessions = sessions.filter(isMeetingSession).length;
  const nFocus = sessions.length - meetingSessions;
  const nMeet = meetingSessions + activities.filter((a) => a.type === "meeting" || a.type === "call").length;
  const nOther = activities.filter((a) => a.type === "email" || a.type === "note" || a.type === "payment").length;
  const denom = nFocus + nMeet + nOther;
  // Breaks is the remainder of the other three, so with no signal at all it
  // would otherwise read 100% — the zero state wants four 0% rings.
  const focus = denom > 0 ? Math.round((nFocus / denom) * 100) : 0;
  const meetings = denom > 0 ? Math.round((nMeet / denom) * 100) : 0;
  const other = denom > 0 ? Math.round((nOther / denom) * 100) : 0;
  const breaks = denom > 0 ? Math.max(0, 100 - focus - meetings - other) : 0;

  return {
    sentence: {
      lead: tr(PERIOD_LEAD[period]),
      time: fmtDuration(totalSec, units),
      tasks: String(sessions.length),
      projects: String(projectCount),
    },
    totalTimeLabel: fmtDurationFull(totalSec, units),
    percentOfDay,
    dayBaseLabel: `${baseHours} ${tr("unit.hr")}`,
    donuts: { focus, meetings, breaks, other },
  };
}

function heatmapView(sessions: Session[], now: Date, tr: TR, locale: string): HeatmapView {
  const units = { hr: tr("unit.hr"), min: tr("unit.min") };
  const WEEKS = 30;
  const perDay = new Map<string, number>();
  for (const s of sessions) perDay.set(
    dayKey(new Date(s.started_at)),
    (perDay.get(dayKey(new Date(s.started_at))) ?? 0) + s.duration_seconds,
  );

  const lvl = (sec: number) => {
    const h = sec / 3600;
    if (h === 0) return 0;
    if (h < 2) return 1;
    if (h < 4) return 2;
    if (h < 6) return 3;
    return 4;
  };

  // Grid ends at the current week; column 0 is 29 weeks back (Monday-aligned).
  const lastMonday = startOfWeek(now);
  const firstMonday = addDays(lastMonday, -(WEEKS - 1) * 7);
  const weeks: HeatmapDay[][] = [];
  const months: string[] = [];
  let lastMonthLabel = "";
  let totalSec = 0;

  for (let w = 0; w < WEEKS; w++) {
    const colStart = addDays(firstMonday, w * 7);
    const label = colStart.toLocaleDateString(locale, { month: "short" });
    if (label !== lastMonthLabel) { months.push(label); lastMonthLabel = label; }
    const days: HeatmapDay[] = [];
    for (let d = 0; d < 7; d++) {
      const cellDate = addDays(colStart, d);
      const sec = perDay.get(dayKey(cellDate)) ?? 0;
      totalSec += sec;
      const dateLabel = cellDate.toLocaleDateString(locale, { month: "short", day: "numeric" });
      days.push({
        level: lvl(sec),
        title: `${dateLabel} · ${sec > 0 ? fmtDuration(sec, units) : tr("metric.noActivity")}`,
      });
    }
    weeks.push(days);
  }

  return {
    weeks,
    months,
    totalHoursLabel: tr("metric.heatmapTotal")
      .replace("{h}", Math.round(totalSec / 3600).toLocaleString(locale))
      .replace("{w}", String(WEEKS)),
  };
}

/** Mon…Sun columns for the week containing `now`, scaled to the busiest day. */
function goalWeekBars(sessions: Session[], now: Date, locale: string): GoalDayBar[] {
  const monday = startOfWeek(now);
  const perDay = new Map<string, number>();
  for (const s of sessions) {
    const k = dayKey(new Date(s.started_at));
    perDay.set(k, (perDay.get(k) ?? 0) + s.duration_seconds);
  }
  const secs = Array.from({ length: 7 }, (_, i) => perDay.get(dayKey(addDays(monday, i))) ?? 0);
  const max = Math.max(1, ...secs);
  return secs.map((sec, i) => ({
    // Figma labels are single letters (M T W T F S S) taken from the locale.
    label: addDays(monday, i).toLocaleDateString(locale, { weekday: "narrow" }),
    heightPct: sec / max,
    empty: sec === 0,
  }));
}

function goalsView(sessions: Session[], now: Date, tr: TR, period: Period, locale: string, settings?: UserSettings | null): GoalsView {
  const units = { hr: tr("unit.hr"), min: tr("unit.min") };
  // Goal scales with the active period; streaks below stay all-time.
  const range = rangeFor(period, now);
  const scoped = sessions.filter((s) => inRange(s.started_at, range));
  const scopedSec = sumBy(scoped, (s) => s.duration_seconds);
  const trackedDays = new Set(scoped.map((s) => dayKey(new Date(s.started_at)))).size;
  const weeklyGoal = (settings?.weekly_goal_hours && settings.weekly_goal_hours > 0) ? settings.weekly_goal_hours : 40;
  const perDay = weeklyGoal / 5;
  const targetHours =
    period === "Day" ? perDay : period === "Week" ? weeklyGoal : period === "Month" ? weeklyGoal * 4 : Math.max(perDay, trackedDays * perDay);
  const targetSec = targetHours * 3600;
  const weeklyPct = Math.min(100, Math.round((scopedSec / targetSec) * 100));

  // Streaks from the set of days that have at least one session.
  const days = new Set(sessions.map((s) => dayKey(new Date(s.started_at))));
  // Current: walk back from today (or yesterday if today is empty).
  let current = 0;
  let cursor = startOfDay(now);
  if (!days.has(dayKey(cursor))) cursor = addDays(cursor, -1);
  while (days.has(dayKey(cursor))) { current++; cursor = addDays(cursor, -1); }

  // Longest: scan all session days chronologically.
  const sorted = [...days].map((k) => {
    const [y, m, d] = k.split("-").map(Number);
    return new Date(y, m, d).getTime();
  }).sort((a, b) => a - b);
  let longest = sorted.length ? 1 : 0;
  let run = longest;
  const DAY = 86400000;
  for (let i = 1; i < sorted.length; i++) {
    run = sorted[i] - sorted[i - 1] <= DAY * 1.5 ? run + 1 : 1;
    if (run > longest) longest = run;
  }

  return {
    weeklyPct,
    weeklyLabel: `${fmtDuration(scopedSec, units)} ${tr("metric.of")} ${targetHours} ${tr("unit.hr")}`,
    currentStreak: current,
    longestStreak: longest,
    week: goalWeekBars(sessions, now, locale),
  };
}

const TL_START_HOUR = 9;
const TL_END_HOUR = 20;               // strip covers 09:00 → 20:00
const TL_SPAN = TL_END_HOUR - TL_START_HOUR;
const TL_TICK_HOURS = [9, 11, 13, 15, 17, 19];
/** Position of an hour-of-day as a percentage of the strip. */
const tlPct = (hours: number) => ((hours - TL_START_HOUR) / TL_SPAN) * 100;

/** A session's timeline lane. Tags drive it: an untagged session is focus. */
function sessionCategory(s: Session): TimelineCategory {
  const tags = (s.tags ?? []).map((t) => t.toLowerCase());
  if (tags.includes("break")) return "breaks";
  if (tags.includes("meeting") || tags.includes("call")) return "meetings";
  return "focus";
}

function timelineView(scoped: Session[]): TimelineView {
  const segments: TimelineSegment[] = [];
  const totals: Record<TimelineCategory, number> = { focus: 0, meetings: 0, breaks: 0 };
  let outsideRangeCount = 0;

  for (const s of scoped) {
    const category = sessionCategory(s);
    totals[category] += s.duration_seconds;

    const start = new Date(s.started_at);
    const h = start.getHours() + start.getMinutes() / 60;
    const leftPct = tlPct(h);
    if (leftPct < 0 || leftPct >= 100) { outsideRangeCount++; continue; }
    // Sub-minute sessions would otherwise render as nothing at all.
    const rawWidth = (s.duration_seconds / 3600 / TL_SPAN) * 100;
    segments.push({
      leftPct,
      widthPct: Math.min(Math.max(0.5, rawWidth), 100 - leftPct),
      category,
    });
  }

  return {
    segments,
    ticks: TL_TICK_HOURS.map((h) => ({ label: `${pad2(h)}:00`, leftPct: tlPct(h) })),
    legend: {
      focus: fmtDurationCompact(totals.focus),
      meetings: fmtDurationCompact(totals.meetings),
      breaks: fmtDurationCompact(totals.breaks),
    },
    empty: segments.length === 0,
    outsideRangeCount,
  };
}

// ── Entry point ──

/** Header date label, adapted to the active period:
 *  Day → "Tuesday, June 16, 2026", Week → "Jun 16 – Jun 22, 2026",
 *  Month → "June 2026", All → "All time". */
function headerLabel(period: Period, now: Date, tr: TR, locale: string): string {
  if (period === "All") return tr("metric.allTime");
  if (period === "Month") return now.toLocaleDateString(locale, { month: "long", year: "numeric" });
  if (period === "Week") {
    const r = rangeFor("Week", now);
    const end = addDays(r.end, -1);
    const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
    return `${r.start.toLocaleDateString(locale, opts)} – ${end.toLocaleDateString(locale, opts)}, ${end.getFullYear()}`;
  }
  return fmtDateLong(now, locale);
}

export function computeMetrics(input: MetricsInput): DashboardMetrics {
  const { sessions, projects, clients, invoices, activities, settings, now, period } = input;
  const tr: TR = (k) => input.t?.(k) ?? dashboard.en[k] ?? k;
  const locale = input.lang ?? "en-US";
  const currency = settings?.default_currency ?? "USD";
  const r = rangeFor(period, now);
  const scoped = sessions.filter((s) => inRange(s.started_at, r));
  const scopedActs = activities.filter((a) => inRange(a.created_at, r));

  const rate = settings?.default_rate ?? 0;

  return {
    header: { dateLabel: headerLabel(period, now, tr, locale) },
    tracking: {
      rate,
      rateLabel: `$${rate}${tr("unit.perHr")}`,
      earnedLabel: fmtMoney(0, currency),
    },
    projects: projectsView(scoped, projects),
    billable: billableView(scoped, clients, invoices, now, tr, period, currency),
    daily: dailyView(scoped, scopedActs, period, tr, settings),
    heatmap: heatmapView(sessions, now, tr, locale),
    goals: goalsView(sessions, now, tr, period, locale, settings),
    timeline: timelineView(scoped),
  };
}
