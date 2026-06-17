import { useState, useEffect } from "react";

const TIMER_KEY = "logr.timer";

interface PersistedTimer {
  running: boolean;
  startedAt: number | null;
  paused: boolean;
  pausedElapsed: number;
  description: string;
}

function readPersistedTimer(): PersistedTimer | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(TIMER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PersistedTimer>;
    return {
      running: Boolean(parsed.running),
      startedAt: typeof parsed.startedAt === "number" ? parsed.startedAt : null,
      paused: Boolean(parsed.paused),
      pausedElapsed: typeof parsed.pausedElapsed === "number" ? parsed.pausedElapsed : 0,
      description: typeof parsed.description === "string" ? parsed.description : "",
    };
  } catch {
    return null;
  }
}

/** Live timer state, persisted to localStorage so it survives reloads. */
export function useTimer() {
  const [timerRunning, setTimerRunning] = useState(() => readPersistedTimer()?.running ?? false);
  const [timerSeconds, setTimerSeconds] = useState(() => {
    const t = readPersistedTimer();
    // timerSeconds is derived from startedAt; restore an estimate if running.
    if (t?.running && t.startedAt != null) {
      return t.pausedElapsed + Math.floor((Date.now() - t.startedAt) / 1000);
    }
    return 0;
  });
  const [timerPaused, setTimerPaused] = useState(() => readPersistedTimer()?.paused ?? false);
  const [timerStartedAt, setTimerStartedAt] = useState<number | null>(() => readPersistedTimer()?.startedAt ?? null);
  const [timerPausedElapsed, setTimerPausedElapsed] = useState(() => readPersistedTimer()?.pausedElapsed ?? 0);
  const [timerDescription, setTimerDescription] = useState(() => readPersistedTimer()?.description ?? "");

  // Sync the persisted timer blob whenever any persisted field changes.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      // Idle/reset: nothing running and no started_at — clear so it can't resurrect.
      if (!timerRunning && timerStartedAt == null) {
        window.localStorage.removeItem(TIMER_KEY);
        return;
      }
      const blob: PersistedTimer = {
        running: timerRunning,
        startedAt: timerStartedAt,
        paused: timerPaused,
        pausedElapsed: timerPausedElapsed,
        description: timerDescription,
      };
      window.localStorage.setItem(TIMER_KEY, JSON.stringify(blob));
    } catch {
      // localStorage may throw (private mode / quota) — ignore.
    }
  }, [timerRunning, timerStartedAt, timerPaused, timerPausedElapsed, timerDescription]);

  return {
    timerRunning, setTimerRunning, timerSeconds, setTimerSeconds,
    timerPaused, setTimerPaused, timerStartedAt, setTimerStartedAt,
    timerPausedElapsed, setTimerPausedElapsed,
    timerDescription, setTimerDescription,
  };
}
