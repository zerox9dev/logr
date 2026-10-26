"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SessionDialog } from "@/components/calendar/session-dialog";
import { useShell } from "@/components/layout/shell-context";
import { useToast } from "@/components/ui/toast";
import { useAppData } from "@/contexts/data-context";
import { useTracker } from "@/contexts/tracker-context";
import {
  atMinutes,
  clamp,
  createRange,
  dayKey,
  layoutDay,
  MINUTES_PER_DAY,
  movedStart,
  overlapSeconds,
  resizedSeconds,
  shiftAnchor,
  snap,
  SNAP_MINUTES,
  spanOnDay,
  visibleDays,
  type Placed,
  type Span,
} from "@/domain/calendar";
import { useLang, useT } from "@/i18n";
import { addDays, startOfDay } from "@/lib/date";
import { isTypingTarget } from "@/lib/keyboard";
import { useMinuteClock } from "@/hooks/use-minute-clock";
import { fmtDurationCompact } from "@/lib/format";
import { projectToneStyle } from "@/lib/project-tone";
import type { Session } from "@/types/database";

/** Pixels per hour on the grid. */
const HOUR_PX = 48;
const PX_PER_MIN = HOUR_PX / 60;
const RUNNING_ID = "__running";
const COUNTS = [1, 3, 5, 7] as const;
type Count = (typeof COUNTS)[number];

const NARROW = "(max-width: 767px)";
function subscribeNarrow(onChange: () => void) {
  const mq = window.matchMedia(NARROW);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

type Drag =
  | { kind: "create"; day: number; from: number; to: number; moved: boolean }
  | { kind: "move"; id: string; grabDay: number; grabMin: number; dDays: number; dMin: number; moved: boolean }
  | { kind: "resize"; id: string; grabMin: number; dMin: number; moved: boolean };

interface Override {
  startedAt: Date;
  seconds: number;
}

function timeLabel(minutes: number, lang: string) {
  return atMinutes(new Date(2000, 0, 1), minutes).toLocaleTimeString(lang, { hour: "numeric", minute: "2-digit" });
}

/**
 * Home screen: the week as a calendar, sessions as blocks on it. Drag on an
 * empty stretch to log time, drag a block to move it, drag its lower edge to
 * change its length, click it to edit. The running timer draws live.
 */
export function CalendarScreen() {
  const { sessions, loading, updateSession, getProjectById, billedSessionIds } = useAppData();
  const tracker = useTracker();
  const shell = useShell();
  const { toast } = useToast();
  const t = useT();
  const { lang } = useLang();

  const [anchor, setAnchor] = useState(() => startOfDay(new Date()));
  const [count, setCount] = useState<Count>(7);
  const narrow = useSyncExternalStore(subscribeNarrow, () => window.matchMedia(NARROW).matches, () => false);
  const shown: Count = narrow ? 1 : count;
  const days = useMemo(() => visibleDays(anchor, shown), [anchor, shown]);
  const now = useMinuteClock();
  const todayKey = dayKey(now);

  const [drag, setDrag] = useState<Drag | null>(null);
  const dragRef = useRef<Drag | null>(null);
  const [pending, setPending] = useState<Record<string, Override>>({});
  const [editing, setEditing] = useState<Session | null>(null);
  const columnsRef = useRef<(HTMLDivElement | null)[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // ── Keyboard: T today, ←/→ page, 1/3/5/7 days ──
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || isTypingTarget(e.target)) return;
      if (e.key === "t") setAnchor(startOfDay(new Date()));
      else if (e.key === "ArrowLeft") setAnchor((a) => shiftAnchor(a, shown, -1));
      else if (e.key === "ArrowRight") setAnchor((a) => shiftAnchor(a, shown, 1));
      else if (COUNTS.includes(Number(e.key) as Count)) setCount(Number(e.key) as Count);
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [shown]);

  // Open on the working day rather than at midnight, once the grid exists.
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (el && !loading) el.scrollTop = 7.5 * HOUR_PX;
  }, [loading]);

  // ── What to draw: sessions (with in-flight drags applied) + the live timer ──
  const byId = useMemo(() => new Map(sessions.map((s) => [s.id, s])), [sessions]);

  const effective = useCallback(
    (s: Session): Override => {
      const base = pending[s.id] ?? { startedAt: new Date(s.started_at), seconds: s.duration_seconds };
      if (drag?.kind === "move" && drag.id === s.id) {
        return { startedAt: movedStart(base.startedAt, drag.dDays, drag.dMin), seconds: base.seconds };
      }
      if (drag?.kind === "resize" && drag.id === s.id) {
        return { startedAt: base.startedAt, seconds: resizedSeconds(base.seconds, drag.dMin) };
      }
      return base;
    },
    [pending, drag],
  );

  const { placedByDay, totalSeconds } = useMemo(() => {
    const from = days[0];
    const to = addDays(days[days.length - 1], 1);
    // Every session that overlaps the view — including one that began days
    // earlier and runs into it — resolved once, not once per visible day.
    const entries: { id: string; startedAt: Date; seconds: number }[] = [];
    for (const s of sessions) {
      const e = effective(s);
      if (overlapSeconds(e.startedAt, e.seconds, from, to) > 0) entries.push({ id: s.id, ...e });
    }
    if (tracker.running && tracker.startedAt != null) {
      entries.push({ id: RUNNING_ID, startedAt: new Date(tracker.startedAt), seconds: tracker.seconds });
    }
    return {
      // Real durations, not drawn spans: the grid pads tiny sessions to a minute.
      totalSeconds: entries.reduce((sum, e) => sum + overlapSeconds(e.startedAt, e.seconds, from, to), 0),
      placedByDay: days.map((day) => {
        const spans: Span[] = [];
        for (const e of entries) {
          const span = spanOnDay(e.id, e.startedAt, e.seconds, day);
          if (span) spans.push(span);
        }
        return layoutDay(spans);
      }),
    };
  }, [days, sessions, effective, tracker.running, tracker.startedAt, tracker.seconds]);

  // ── Pointer geometry ──
  const pointerAt = (clientX: number, clientY: number) => {
    const cols = columnsRef.current;
    let day = 0;
    for (let i = 0; i < cols.length; i++) {
      const r = cols[i]?.getBoundingClientRect();
      if (r && clientX >= r.left) day = i;
    }
    const rect = cols[day]?.getBoundingClientRect();
    const minutes = rect ? (clientY - rect.top) / PX_PER_MIN : 0;
    return { day, minutes: clamp(minutes, 0, MINUTES_PER_DAY) };
  };

  const begin = (e: React.PointerEvent, next: Drag) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = next;
    setDrag(next);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    const p = pointerAt(e.clientX, e.clientY);
    let next: Drag;
    if (d.kind === "create") {
      const to = snap(p.minutes);
      next = { ...d, to, moved: d.moved || to !== d.from };
    } else if (d.kind === "move") {
      const dMin = snap(p.minutes - d.grabMin);
      const dDays = p.day - d.grabDay;
      next = { ...d, dMin, dDays, moved: d.moved || dMin !== 0 || dDays !== 0 };
    } else {
      const dMin = snap(p.minutes - d.grabMin);
      next = { ...d, dMin, moved: d.moved || dMin !== 0 };
    }
    dragRef.current = next;
    setDrag(next);
  };

  const commit = async (id: string, value: Override) => {
    const session = byId.get(id);
    if (!session) return;
    setPending((p) => ({ ...p, [id]: value }));
    try {
      await updateSession(id, { started_at: value.startedAt.toISOString(), duration_seconds: Math.round(value.seconds) });
    } catch {
      toast(t("cal.moveFailed"), "error");
    } finally {
      setPending((p) => {
        const next = { ...p };
        delete next[id];
        return next;
      });
    }
  };

  const onPointerUp = () => {
    const d = dragRef.current;
    dragRef.current = null;
    setDrag(null);
    if (!d) return;
    if (d.kind === "create") {
      const range = createRange(d.from, d.to, d.moved);
      if (range) shell.openNewEntry({ start: atMinutes(days[d.day], range.start), seconds: (range.end - range.start) * 60 });
      return;
    }
    const session = byId.get(d.id);
    if (!session) return;
    if (!d.moved) {
      setEditing(session);
      return;
    }
    const base = pending[d.id] ?? { startedAt: new Date(session.started_at), seconds: session.duration_seconds };
    if (d.kind === "move") void commit(d.id, { startedAt: movedStart(base.startedAt, d.dDays, d.dMin), seconds: base.seconds });
    else void commit(d.id, { startedAt: base.startedAt, seconds: resizedSeconds(base.seconds, d.dMin) });
  };

  // ── Header labels ──
  const first = days[0];
  const last = days[days.length - 1];
  const monthTitle =
    first.getMonth() === last.getMonth()
      ? first.toLocaleDateString(lang, { month: "long", year: "numeric" })
      : `${first.toLocaleDateString(lang, { month: "short" })} – ${last.toLocaleDateString(lang, { month: "short", year: "numeric" })}`;
  const countLabel = (c: Count) => (c === 1 ? t("cal.day") : c === 7 ? t("cal.week") : t("cal.days").replace("{n}", String(c)));

  const block = (p: Placed, day: number) => {
    const live = p.id === RUNNING_ID;
    const session = live ? null : byId.get(p.id);
    const projectId = live ? tracker.projectId : (session?.project_id ?? null);
    const title = live ? tracker.description || t("cal.running") : session?.name || "Untitled";
    const projectName = getProjectById(projectId)?.name;
    const height = Math.max(18, (p.end - p.start) * PX_PER_MIN - 2);
    const locked = live || (session ? billedSessionIds.has(session.id) : true);
    const dragging = drag && drag.kind !== "create" && drag.id === p.id;
    const startLabel = timeLabel(p.start, lang);
    const endLabel = timeLabel(p.end, lang);
    return (
      <div
        key={`${p.id}-${day}`}
        role={live ? undefined : "button"}
        tabIndex={live ? undefined : 0}
        aria-label={`${title}, ${startLabel} – ${endLabel}`}
        onKeyDown={(e) => {
          if (!live && session && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            setEditing(session);
          }
        }}
        onPointerDown={(e) => {
          // Nothing under a block — the live one included — may start a create-drag.
          if (live || !session || locked) e.stopPropagation();
          if (live || !session) return;
          if (locked) {
            e.stopPropagation();
            return;
          }
          const pt = pointerAt(e.clientX, e.clientY);
          begin(e, { kind: "move", id: p.id, grabDay: day, grabMin: pt.minutes, dDays: 0, dMin: 0, moved: false });
        }}
        onClick={() => {
          if (locked && session) setEditing(session);
        }}
        style={{
          ...projectToneStyle(projectId),
          top: p.start * PX_PER_MIN + 1,
          height,
          left: `calc(${(p.column / p.columns) * 100}% + 2px)`,
          width: `calc(${100 / p.columns}% - 4px)`,
        }}
        className={`app-focus group/event absolute flex overflow-hidden rounded-[6px] bg-(--fill) text-(--ink) transition-shadow select-none ${
          live ? "ring-1 ring-(--cal-accent)/50" : locked ? "cursor-pointer" : "cursor-grab active:cursor-grabbing"
        } ${dragging ? "z-20 shadow-(--cal-raised-shadow)" : "z-10 hover:z-20"}`}
      >
        <span aria-hidden="true" className={`w-[3px] shrink-0 bg-(--bar) ${live ? "animate-pulse motion-reduce:animate-none" : ""}`} />
        <div className="min-w-0 flex-1 px-1.5 py-[3px] leading-[1.3]">
          <p className="truncate text-[12px] font-semibold">{title}</p>
          {height > 34 ? (
            <p className="truncate text-[11px] opacity-75 tnum">
              {startLabel} – {endLabel}
            </p>
          ) : null}
          {height > 52 && projectName ? <p className="truncate text-[11px] opacity-75">{projectName}</p> : null}
        </div>
        {!locked ? (
          <span
            aria-hidden="true"
            onPointerDown={(e) => {
              const pt = pointerAt(e.clientX, e.clientY);
              begin(e, { kind: "resize", id: p.id, grabMin: pt.minutes, dMin: 0, moved: false });
            }}
            className="absolute inset-x-0 bottom-0 h-2 cursor-ns-resize"
          />
        ) : null}
      </div>
    );
  };

  // Dates depend on the viewer's clock and time zone, so nothing date-shaped
  // is server-rendered; the data loads client-side anyway.
  if (loading) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center bg-card">
        <div role="status" className="size-5 animate-spin rounded-full border-2 border-line border-t-tertiary">
          <span className="sr-only">{t("screen.loading")}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-card">
      {/* Calendar header: month, paging, how much is on screen, day count */}
      <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 md:px-5">
        <h1 className="text-[20px] font-semibold tracking-[-0.01em] text-heading first-letter:uppercase">{monthTitle}</h1>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setAnchor((a) => shiftAnchor(a, shown, -1))}
            aria-label={t("cal.prev")}
            className="app-focus flex size-7 items-center justify-center rounded-md text-tertiary transition-colors hover:bg-wash hover:text-heading"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setAnchor((a) => shiftAnchor(a, shown, 1))}
            aria-label={t("cal.next")}
            className="app-focus flex size-7 items-center justify-center rounded-md text-tertiary transition-colors hover:bg-wash hover:text-heading"
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setAnchor(startOfDay(new Date()))}
            title={`${t("cal.today")} (T)`}
            className="app-focus ml-1 h-7 rounded-md border border-line px-2.5 text-[12.5px] font-medium text-heading transition-colors hover:bg-wash"
          >
            {t("cal.today")}
          </button>
        </div>
        <span className="text-[12.5px] text-tertiary tnum">
          {t("cal.total").replace("{h}", fmtDurationCompact(Math.round(totalSeconds)))}
        </span>
        <div role="radiogroup" aria-label={t("cal.viewLabel")} className="ml-auto flex items-center gap-0.5 rounded-md bg-wash p-0.5 max-md:hidden">
          {COUNTS.map((c) => (
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={count === c}
              onClick={() => setCount(c)}
              title={`${countLabel(c)} (${c})`}
              className="app-focus h-6 cursor-pointer rounded-[5px] px-2.5 text-[12.5px] font-medium text-tertiary transition-colors hover:text-heading aria-checked:bg-card aria-checked:text-heading aria-checked:shadow-(--cal-segment-shadow)"
            >
              {countLabel(c)}
            </button>
          ))}
        </div>
      </div>

      {/* Day headings, aligned with the columns below */}
      <div className="flex shrink-0 border-y border-line">
        <div className="w-14 shrink-0" />
        {days.map((d) => {
          const isToday = dayKey(d) === todayKey;
          return (
            <div key={dayKey(d)} className="flex min-w-0 flex-1 items-baseline gap-1.5 border-l border-line px-2 py-1.5 first:border-l-0">
              <span className={`text-[12px] ${isToday ? "text-(--cal-accent-strong)" : "text-tertiary"}`}>
                {d.toLocaleDateString(lang, { weekday: "short" })}
              </span>
              <span
                className={`flex h-6 min-w-6 items-center justify-center rounded-full px-1 text-[13px] font-semibold tnum ${
                  isToday ? "bg-(--cal-accent-strong) text-white" : "text-heading"
                }`}
              >
                {d.getDate()}
              </span>
            </div>
          );
        })}
      </div>

      <div ref={scrollRef} className="cal-scroll relative min-h-0 flex-1 overflow-y-auto">
        <div className="relative flex" style={{ height: 24 * HOUR_PX }}>
          {/* Hour gutter */}
          <div className="relative w-14 shrink-0" aria-hidden="true">
            {Array.from({ length: 23 }, (_, i) => i + 1).map((h) => (
              <span
                key={h}
                style={{ top: h * HOUR_PX - 7 }}
                className="absolute right-2 text-[10.5px] text-tertiary tnum"
              >
                {timeLabel(h * 60, lang)}
              </span>
            ))}
          </div>

          {days.map((d, i) => {
            const key = dayKey(d);
            const isToday = key === todayKey;
            const nowMin = now.getHours() * 60 + now.getMinutes();
            const ghost = drag?.kind === "create" && drag.day === i ? drag : null;
            const ghostFrom = ghost ? Math.min(ghost.from, ghost.to) : 0;
            const ghostTo = ghost ? Math.max(ghost.from, ghost.to, ghostFrom + SNAP_MINUTES) : 0;
            return (
              <div
                key={key}
                ref={(el) => {
                  columnsRef.current[i] = el;
                }}
                onPointerDown={(e) => {
                  const pt = pointerAt(e.clientX, e.clientY);
                  const from = Math.floor(pt.minutes / SNAP_MINUTES) * SNAP_MINUTES;
                  begin(e, { kind: "create", day: i, from, to: from, moved: false });
                }}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={() => {
                  dragRef.current = null;
                  setDrag(null);
                }}
                className={`relative min-w-0 flex-1 cursor-crosshair touch-pan-y border-l border-line first:border-l-0 ${
                  isToday ? "bg-[color-mix(in_srgb,var(--cal-accent)_3%,transparent)]" : ""
                }`}
                style={{
                  backgroundImage: `repeating-linear-gradient(to bottom, transparent 0, transparent ${HOUR_PX - 1}px, var(--cal-line-soft) ${HOUR_PX - 1}px, var(--cal-line-soft) ${HOUR_PX}px)`,
                }}
              >
                {placedByDay[i].map((p) => block(p, i))}

                {ghost ? (
                  <div
                    aria-hidden="true"
                    style={{
                      ...projectToneStyle(tracker.projectId),
                      top: ghostFrom * PX_PER_MIN,
                      height: (ghostTo - ghostFrom) * PX_PER_MIN,
                    }}
                    className="pointer-events-none absolute inset-x-0.5 z-30 rounded-[6px] border border-dashed border-(--bar) bg-(--fill)/80 px-1.5 py-[3px] text-[11px] font-medium text-(--ink) tnum"
                  >
                    {timeLabel(ghostFrom, lang)} – {timeLabel(ghostTo, lang)}
                  </div>
                ) : null}

                {isToday ? (
                  <div aria-hidden="true" style={{ top: nowMin * PX_PER_MIN }} className="pointer-events-none absolute inset-x-0 z-30">
                    <span className="absolute -top-[4px] -left-[4px] size-2 rounded-full bg-(--cal-accent)" />
                    <span className="block h-[1.5px] bg-(--cal-accent)" />
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        {sessions.length === 0 && !tracker.running ? (
          <p className="pointer-events-none sticky bottom-4 mx-auto w-fit rounded-md bg-heading px-3 py-1.5 text-[12.5px] text-card">
            {t("cal.hint")}
          </p>
        ) : null}
      </div>

      <SessionDialog session={editing} onClose={() => setEditing(null)} />
    </div>
  );
}
