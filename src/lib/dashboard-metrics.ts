import type {
  Session, Project, Client, Invoice, Activity, UserSettings,
} from "@/types/database";

// ── Period ──

export type Period = "Day" | "Week" | "Month" | "All";

export interface Range {
  start: Date;
  end: Date;
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function startOfWeek(d: Date): Date {
  const x = startOfDay(d);
  const day = (x.getDay() + 6) % 7; // Monday = 0
  x.setDate(x.getDate() - day);
  return x;
}

function startOfMonth(d: Date): Date {
  const x = startOfDay(d);
  x.setDate(1);
  return x;
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

/** Inclusive-start, exclusive-end range for the period containing `now`. */
export function rangeFor(period: Period, now: Date): Range {
  if (period === "Day") return { start: startOfDay(now), end: addDays(startOfDay(now), 1) };
  if (period === "Week") return { start: startOfWeek(now), end: addDays(startOfWeek(now), 7) };
  if (period === "Month") return { start: startOfMonth(now), end: new Date(now.getFullYear(), now.getMonth() + 1, 1) };
  return { start: new Date(0), end: addDays(startOfDay(now), 1) }; // All time → everything up to end of today
}

function inRange(iso: string, r: Range): boolean {
  const t = new Date(iso).getTime();
  return t >= r.start.getTime() && t < r.end.getTime();
}

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
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

// ── Formatters ──

const pad2 = (n: number) => String(n).padStart(2, "0");

/** "3 hr 26 min", "2 hr 06 min", "55 min". Units default to English. */
export function fmtDuration(seconds: number, units: { hr: string; min: string } = { hr: "hr", min: "min" }): string {
  const total = Math.max(0, Math.round(seconds / 60));
  const h = Math.floor(total / 60);
  const m = total % 60;
  return h > 0 ? `${h} ${units.hr} ${pad2(m)} ${units.min}` : `${m} ${units.min}`;
}

/** "02:47:18" — live timer clock. */
export function fmtClock(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  return `${pad2(Math.floor(s / 3600))}:${pad2(Math.floor((s % 3600) / 60))}:${pad2(s % 60)}`;
}

/** "$222.50", "$1,890.00". */
export function fmtMoney(n: number): string {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function fmtDateLong(d: Date, locale = "en-US"): string {
  return d.toLocaleDateString(locale, {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });
}

/** Resolves an i18n key. Provided by the app; defaults to English below. */
type TR = (key: string) => string;

/** English fallbacks so computeMetrics stays English when no translator is
 *  passed (keeps the pure formatters and their tests stable). A real `t` from
 *  the app overrides every one of these. */
const EN_METRIC: Record<string, string> = {
  "unit.hr": "hr",
  "unit.min": "min",
  "unit.perHr": "/hr",
  "metric.earned": "earned",
  "metric.ofTrackedTime": "of tracked time",
  "metric.noClient": "No client",
  "metric.internal": "Internal",
  "metric.leadToday": "Today",
  "metric.leadWeek": "This week",
  "metric.leadMonth": "This month",
  "metric.leadAll": "In total",
  "metric.noActivity": "No activity",
  "metric.of": "of",
  "metric.allTime": "All time",
  "metric.heatmapTotal": "{h} hours tracked over the last {w} weeks",
};

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
  today: Date; // real current date (anchors the "now" marker)
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

export interface GoalsView {
  weeklyPct: number;
  weeklyLabel: string;
  currentStreak: number;
  longestStreak: number;
}

/** A single session, positioned on the day axis. Color encodes billable. */
export interface TimelineBlock {
  left: number;
  width: number;
  color: string;
}

/** One hour-of-day column in the aggregate (wide-period) view. */
export interface TimelineHourBar {
  left: number;
  width: number;
  heightPct: number; // 0..1 of the plot height
}

export interface TimelineView {
  mode: "sessions" | "hourly";
  blocks: TimelineBlock[];     // sessions mode (Day)
  hours: TimelineHourBar[];    // hourly mode (Week/Month/All)
  nowLeft: number;
  nowLabel: string;
  showNow: boolean;
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

function billableView(sessions: Session[], clients: Client[], invoices: Invoice[], now: Date, tr: TR, period: Period): BillableView {
  const units = { hr: tr("unit.hr"), min: tr("unit.min") };
  const billable = sessions.filter(isBillable);
  const nonBillable = sessions.filter((s) => !isBillable(s));
  const billSec = sumBy(billable, (s) => s.duration_seconds);
  const nonSec = sumBy(nonBillable, (s) => s.duration_seconds);
  const total = billSec + nonSec || 1;
  const billPct = Math.round((billSec / total) * 100);

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
        amountLabel: fmtMoney(amount),
        dot: "#2f7a5b",
        internal: false,
      };
    });

  if (nonSec > 0) {
    clientRows.push({
      name: tr("metric.internal"),
      timeLabel: fmtDuration(nonSec, units),
      amountLabel: "—",
      dot: "#a1a1aa",
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
    billableTimeLabel: fmtDuration(billSec, units),
    billableEarnedLabel: `${fmtMoney(sumBy(billable, earned))} ${tr("metric.earned")}`,
    nonBillableTimeLabel: fmtDuration(nonSec, units),
    billablePct: billPct,
    nonBillablePct: 100 - billPct,
    pctLabel: `${billPct}% ${tr("metric.ofTrackedTime")}`,
    nonBillablePctLabel: `${100 - billPct}%`,
    clients: clientRows,
    invoicedLabel: fmtMoney(invoiced),
  };
}

function dailyView(sessions: Session[], activities: Activity[], period: Period, tr: TR): DailyView {
  const units = { hr: tr("unit.hr"), min: tr("unit.min") };
  const totalSec = sumBy(sessions, (s) => s.duration_seconds);
  // "All" has no fixed window — measure against an 8h day for each tracked day.
  const trackedDays = new Set(sessions.map((s) => dayKey(new Date(s.started_at)))).size;
  const baseHours =
    period === "Day" ? 8 : period === "Week" ? 40 : period === "Month" ? 160 : Math.max(8, trackedDays * 8);
  const percentOfDay = Math.min(100, Math.round((totalSec / (baseHours * 3600)) * 100));

  const projectCount = new Set(sessions.map((s) => s.project_id).filter(Boolean)).size;

  // Donuts: Focus = sessions, the rest split by activity type counts.
  const nFocus = sessions.length;
  const nMeet = activities.filter((a) => a.type === "meeting" || a.type === "call").length;
  const nOther = activities.filter((a) => a.type === "email" || a.type === "note" || a.type === "payment").length;
  const denom = nFocus + nMeet + nOther || 1;
  const focus = Math.round((nFocus / denom) * 100);
  const meetings = Math.round((nMeet / denom) * 100);
  const other = Math.round((nOther / denom) * 100);
  const breaks = Math.max(0, 100 - focus - meetings - other);

  return {
    sentence: {
      lead: tr(PERIOD_LEAD[period]),
      time: fmtDuration(totalSec, units),
      tasks: String(sessions.length),
      projects: String(projectCount),
    },
    totalTimeLabel: fmtDuration(totalSec, units),
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

function goalsView(sessions: Session[], now: Date, tr: TR, period: Period): GoalsView {
  const units = { hr: tr("unit.hr"), min: tr("unit.min") };
  // Goal scales with the active period; streaks below stay all-time.
  const range = rangeFor(period, now);
  const scoped = sessions.filter((s) => inRange(s.started_at, range));
  const scopedSec = sumBy(scoped, (s) => s.duration_seconds);
  const trackedDays = new Set(scoped.map((s) => dayKey(new Date(s.started_at)))).size;
  const targetHours =
    period === "Day" ? 8 : period === "Week" ? 40 : period === "Month" ? 160 : Math.max(8, trackedDays * 8);
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
  };
}

const TL_W = 955;
const TL_HOUR_PX = 81.034;
const TL_ORIGIN = 10;
const TL_START_HOUR = 9;
const TL_END_HOUR = 20; // axis covers 9:00 → 20:00 (12 gridlines)
// Map an hour-of-day to an x in the 955px frame (9:00 → ORIGIN).
const tlX = (hours: number) => TL_ORIGIN + (hours - TL_START_HOUR) * TL_HOUR_PX;

function timelineView(scoped: Session[], now: Date, period: Period, today: Date): TimelineView {
  const nowH = today.getHours() + today.getMinutes() / 60;
  const base = {
    nowLeft: tlX(nowH),
    nowLabel: `${pad2(today.getHours())}:${pad2(today.getMinutes())}`,
    // "now" marker only on the single-day view of the actual current day.
    showNow: period === "Day" && sameDay(now, today),
  };

  // ── Day: each session as a positioned block, colored by billable. ──
  if (period === "Day") {
    const blocks: TimelineBlock[] = [];
    for (const s of scoped) {
      const start = new Date(s.started_at);
      const h = start.getHours() + start.getMinutes() / 60;
      const left = tlX(h);
      if (left < TL_ORIGIN || left > TL_W) continue;
      const width = Math.min(Math.max(2, (s.duration_seconds / 3600) * TL_HOUR_PX), TL_W - left);
      blocks.push({
        left,
        width,
        color: isBillable(s) ? "var(--color-brand)" : "var(--color-error-soft)",
      });
    }
    return { mode: "sessions", blocks, hours: [], ...base };
  }

  // ── Week/Month/All: aggregate total time per hour-of-day across the range. ──
  const buckets = new Array(TL_END_HOUR - TL_START_HOUR + 1).fill(0); // 9..20
  for (const s of scoped) {
    const hour = new Date(s.started_at).getHours();
    const idx = hour - TL_START_HOUR;
    if (idx < 0 || idx >= buckets.length) continue;
    buckets[idx] += s.duration_seconds;
  }
  const maxSec = Math.max(1, ...buckets);
  const barW = TL_HOUR_PX * 0.62;
  const hours: TimelineHourBar[] = buckets.map((sec, i) => ({
    left: tlX(TL_START_HOUR + i) + (TL_HOUR_PX - barW) / 2,
    width: barW,
    heightPct: sec / maxSec,
  })).filter((b) => b.heightPct > 0);

  return { mode: "hourly", blocks: [], hours, ...base };
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
  const { sessions, projects, clients, invoices, activities, settings, now, today, period } = input;
  const tr: TR = (k) => input.t?.(k) ?? EN_METRIC[k] ?? k;
  const locale = input.lang ?? "en-US";
  const r = rangeFor(period, now);
  const scoped = sessions.filter((s) => inRange(s.started_at, r));
  const scopedActs = activities.filter((a) => inRange(a.created_at, r));

  const rate = settings?.default_rate ?? 0;

  return {
    header: { dateLabel: headerLabel(period, now, tr, locale) },
    tracking: {
      rate,
      rateLabel: `$${rate}${tr("unit.perHr")}`,
      earnedLabel: fmtMoney(0),
    },
    projects: projectsView(scoped, projects),
    billable: billableView(scoped, clients, invoices, now, tr, period),
    daily: dailyView(scoped, scopedActs, period, tr),
    heatmap: heatmapView(sessions, now, tr, locale),
    goals: goalsView(sessions, now, tr, period),
    timeline: timelineView(scoped, now, period, today),
  };
}
