"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useToast } from "@/components/ui/toast";
import { useAppData } from "@/contexts/data-context";
import { resolveSessionRate } from "@/domain/employer";
import { buildSession } from "@/domain/tracking";
import { useT } from "@/i18n";
import { fmtClock } from "@/lib/format";
import type { Project } from "@/types/database";

/**
 * The live timer and the project it tracks against, shared by the title bar,
 * the projects panel and the calendar. The clock itself lives in the data
 * layer (persisted across reloads); this adds the selection, the ticking and
 * the save-on-stop.
 */
function useTrackerState() {
  const {
    sessions, settings, getProjectById, getClientById, addSession,
    timerRunning, setTimerRunning,
    timerSeconds, setTimerSeconds,
    timerStartedAt, setTimerStartedAt,
    timerDescription, setTimerDescription,
  } = useAppData();
  const { toast } = useToast();
  const t = useT();

  // Until the user picks one, track against the project of the latest session.
  const [picked, setPicked] = useState<string | null | undefined>(undefined);
  const projectId = picked === undefined ? (sessions[0]?.project_id ?? null) : picked;
  const project = getProjectById(projectId);

  const rateFor = useCallback(
    (p: Project | undefined) => resolveSessionRate(getClientById(p?.client_id ?? null), p, settings),
    [getClientById, settings],
  );
  const rate = rateFor(project);

  // Tick from the wall clock so it stays accurate across tab throttling.
  useEffect(() => {
    if (!timerRunning || timerStartedAt == null) return;
    const id = setInterval(() => setTimerSeconds(Math.floor((Date.now() - timerStartedAt) / 1000)), 1000);
    return () => clearInterval(id);
  }, [timerRunning, timerStartedAt, setTimerSeconds]);

  const start = useCallback(() => {
    setTimerStartedAt(Date.now());
    setTimerSeconds(0);
    setTimerRunning(true);
  }, [setTimerRunning, setTimerSeconds, setTimerStartedAt]);

  /** Stop and save. If the save fails the timer is put back exactly as it
   *  was — still running from the same start — so no tracked time is lost. */
  const stop = useCallback(async () => {
    setTimerRunning(false);
    const duration = timerSeconds;
    const startedAt = timerStartedAt ?? Date.now() - duration * 1000;
    const savedDescription = timerDescription;
    setTimerStartedAt(null);
    setTimerSeconds(0);
    setTimerDescription("");
    if (duration < 1) return;
    try {
      await addSession(buildSession(project, savedDescription, startedAt, duration, rate));
      toast(`${t("track.saved")} ${fmtClock(duration)} ${t("track.savedTo")} ${project?.name ?? t("track.noProject")}`, "success");
    } catch {
      setTimerStartedAt(startedAt);
      setTimerSeconds(duration);
      setTimerDescription(savedDescription);
      setTimerRunning(true);
      toast(t("track.saveFailed"), "error");
    }
  }, [
    addSession, project, rate, t, toast, timerDescription, timerSeconds, timerStartedAt,
    setTimerDescription, setTimerRunning, setTimerSeconds, setTimerStartedAt,
  ]);

  const toggle = useCallback(() => (timerRunning ? stop() : start()), [timerRunning, start, stop]);

  /** Point the timer at another project. Mid-run, the stretch so far is saved
   *  to the project it was tracked against, at that project's rate, and the
   *  clock carries on for the new one — switching never rebills past work.
   *  If that save fails, the switch is undone so no time is lost. */
  const selectProject = useCallback(
    async (id: string | null) => {
      if (id === projectId) return;
      setPicked(id);
      if (!timerRunning || timerStartedAt == null) return;
      const now = Date.now();
      const duration = Math.floor((now - timerStartedAt) / 1000);
      if (duration < 1) return;
      const previous = { id: projectId, startedAt: timerStartedAt, seconds: timerSeconds };
      setTimerStartedAt(now);
      setTimerSeconds(0);
      try {
        await addSession(buildSession(project, timerDescription, timerStartedAt, duration, rate));
        toast(`${t("track.saved")} ${fmtClock(duration)} ${t("track.savedTo")} ${project?.name ?? t("track.noProject")}`, "success");
      } catch {
        setPicked(previous.id);
        setTimerStartedAt(previous.startedAt);
        setTimerSeconds(previous.seconds);
        toast(t("track.saveFailed"), "error");
      }
    },
    [
      addSession, project, projectId, rate, t, toast, timerDescription, timerRunning, timerSeconds, timerStartedAt,
      setTimerSeconds, setTimerStartedAt,
    ],
  );

  /** Log a finished stretch of work against a project, at that project's rate. */
  const logSession = useCallback(
    async (pid: string | null, name: string, startedAt: Date, seconds: number) => {
      const p = getProjectById(pid);
      try {
        const created = await addSession(buildSession(p, name, startedAt.getTime(), seconds, rateFor(p)));
        toast(`${t("track.logged")} ${fmtClock(seconds)}`, "success");
        return created;
      } catch {
        toast(t("track.logFailed"), "error");
        return null;
      }
    },
    [addSession, getProjectById, rateFor, t, toast],
  );

  // Memoised so consumers re-render when tracker state changes, not on every
  // render of the provider; while running, `seconds` still ticks each second.
  return useMemo(
    () => ({
      projectId, project, setProjectId: selectProject,
      rate, rateFor,
      running: timerRunning, seconds: timerSeconds, startedAt: timerStartedAt,
      description: timerDescription, setDescription: setTimerDescription,
      start, stop, toggle, logSession,
    }),
    [
      projectId, project, selectProject, rate, rateFor, timerRunning, timerSeconds, timerStartedAt,
      timerDescription, setTimerDescription, start, stop, toggle, logSession,
    ],
  );
}

type Tracker = ReturnType<typeof useTrackerState>;

const TrackerContext = createContext<Tracker | null>(null);

export function TrackerProvider({ children }: { children: ReactNode }) {
  const tracker = useTrackerState();
  return <TrackerContext.Provider value={tracker}>{children}</TrackerContext.Provider>;
}

export function useTracker() {
  const ctx = useContext(TrackerContext);
  if (!ctx) throw new Error("useTracker must be inside TrackerProvider");
  return ctx;
}
