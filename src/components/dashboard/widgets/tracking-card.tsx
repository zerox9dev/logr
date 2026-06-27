import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/toast";
import { useAppData } from "@/contexts/data-context";
import { useT } from "@/i18n";
import { fmtClock, fmtMoney } from "@/lib/format";
import { ProjectPicker } from "@/components/shared/project-picker";
import { ManualDialog } from "@/components/dashboard/manual-entry-dialog";
import { RatesDialog } from "@/components/dashboard/rates-dialog";
import { useSessionSuggestion } from "@/hooks/use-session-suggestion";
import type { Project, SessionInsert } from "@/types/database";

/** Build a SessionInsert from a project + task + timing, applying the
 *  project's rate/billing (falling back to the user's defaults). */
function buildSession(
  project: Project | undefined,
  name: string,
  startedAtMs: number,
  durationSeconds: number,
  defaultRate: number,
): Omit<SessionInsert, "user_id"> {
  return {
    client_id: project?.client_id ?? null,
    project_id: project?.id ?? null,
    name: name.trim() || "Untitled",
    notes: null,
    tags: [],
    started_at: new Date(startedAtMs).toISOString(),
    duration_seconds: durationSeconds,
    rate: project?.rate ?? defaultRate,
    billing_type: project?.billing_type ?? "hourly",
    payment_status: "unpaid",
  };
}

/** Tracking card — Figma 1:28. Blinking dot + 52px timer + rate/earned (rate
 *  chip opens the Rates manager), Start/Stop + Manual, project › task row. */
export function TrackingCard() {
  const {
    sessions, projects, settings, getProjectById, addSession,
    timerRunning, setTimerRunning,
    timerSeconds, setTimerSeconds,
    timerStartedAt, setTimerStartedAt,
    timerDescription, setTimerDescription,
  } = useAppData();
  const { toast } = useToast();
  const t = useT();

  const recent = sessions[0];
  const [projectId, setProjectId] = useState<string | null>(recent?.project_id ?? null);
  const [manualOpen, setManualOpen] = useState(false);
  const [ratesOpen, setRatesOpen] = useState(false);

  const { suggestion, dismiss } = useSessionSuggestion(timerDescription, projectId);

  const project = getProjectById(projectId);
  const projectName = project?.name ?? t("track.untracked");
  const rate = project?.rate ?? settings?.default_rate ?? 0;
  const earned = (timerSeconds / 3600) * rate;

  // Tick the timer from wall-clock so it stays accurate across throttling.
  useEffect(() => {
    if (!timerRunning || timerStartedAt == null) return;
    const id = setInterval(() => {
      setTimerSeconds(Math.floor((Date.now() - timerStartedAt) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [timerRunning, timerStartedAt, setTimerSeconds]);

  const start = () => {
    setTimerStartedAt(Date.now());
    setTimerSeconds(0);
    setTimerRunning(true);
  };

  const stop = async () => {
    setTimerRunning(false);
    const duration = timerSeconds;
    const startedAt = timerStartedAt ?? Date.now() - duration * 1000;
    const savedDescription = timerDescription;
    setTimerStartedAt(null);
    setTimerSeconds(0);
    setTimerDescription("");
    if (duration >= 1) {
      try {
        await addSession(buildSession(project, savedDescription, startedAt, duration, rate));
        toast(`${t("track.saved")} ${fmtClock(duration)} ${t("track.savedTo")} ${projectName}`, "success");
      } catch {
        setTimerDescription(savedDescription);
        toast(t("track.saveFailed"), "error");
      }
    }
  };

  const saveManual = async (pid: string | null, name: string, dateISO: string, seconds: number) => {
    const proj = getProjectById(pid);
    try {
      await addSession(buildSession(proj, name, new Date(dateISO).getTime(), seconds, proj?.rate ?? settings?.default_rate ?? 0));
      toast(`${t("track.logged")} ${fmtClock(seconds)}`, "success");
    } catch {
      toast(t("track.logFailed"), "error");
    }
  };

  return (
    <div className="flex flex-col gap-4 border border-line bg-card p-6">
      {/* Top row: timer-block (dot · timer / rate · earned) + actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span
            aria-hidden="true"
            className={`size-[9px] shrink-0 rounded-full ${timerRunning ? "animate-pulse bg-money" : "bg-track"}`}
          />
          <span
            role="timer"
            aria-label={t("track.timerAriaLabel").replace("{time}", fmtClock(timerSeconds))}
            className="text-4xl font-bold tracking-[2px] text-heading tnum lg:text-hero"
          >
            {fmtClock(timerSeconds)}
          </span>
          <span className="sr-only">{timerRunning ? t("track.timerRunning") : t("track.timerStopped")}</span>
          <button
            type="button"
            onClick={() => setRatesOpen(true)}
            aria-label={t("rates.editAria")}
            title={t("rates.editAria")}
            className="bg-brand-soft px-[11px] py-1 text-sm font-semibold text-brand tnum transition-opacity hover:opacity-80"
          >
            ${rate}{t("unit.perHr")}{rate === 0 && <span aria-hidden="true" className="ml-1 text-xs font-normal text-muted-foreground">✎</span>}
          </button>
          <span className="text-base font-semibold text-brand tnum">{fmtMoney(earned)} {t("track.earned")}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={timerRunning ? stop : start}
            className={`px-[30px] py-[11px] text-base font-semibold text-card transition-colors ${
              timerRunning ? "bg-red-600 hover:bg-red-700" : "bg-money hover:opacity-90"
            }`}
          >
            {timerRunning ? t("track.stop") : t("track.start")}
          </button>
          <button
            onClick={() => setManualOpen(true)}
            className="flex h-[40px] items-center justify-center border border-gray-300 bg-card px-[22px] text-md font-medium text-ink transition-colors"
          >
            {t("track.manual")}
          </button>
        </div>
      </div>

      {/* Bottom row: project › task */}
      <div className="flex flex-wrap items-center gap-2.5">
        <ProjectPicker
          onChange={setProjectId}
          projects={projects}
          trigger={
            <button className="flex max-w-[220px] items-center gap-2 bg-purple-soft py-1.5 pl-2.5 pr-3 transition-colors">
              <span aria-hidden="true" className="h-3 w-4 shrink-0 bg-black" />
              <span className="line-clamp-1 min-w-0 text-md font-semibold text-heading">{projectName}</span>
            </button>
          }
        />
        <span aria-hidden="true" className="text-base text-muted-foreground">›</span>
        <input
          value={timerDescription}
          onChange={(e) => setTimerDescription(e.target.value)}
          placeholder={t("track.workingPlaceholder")}
          className="min-w-[120px] flex-1 bg-transparent text-base font-medium text-heading placeholder:font-normal placeholder:text-muted-foreground focus:outline-none"
        />
      </div>

      {/* Inline project suggestion — accept applies the project (and its
          rate/billing); ✕ dismisses it. Local history match, LLM fallback. */}
      {suggestion && (
        <div className="flex flex-wrap items-center gap-2 text-md">
          <span aria-hidden="true">✨</span>
          <span className="text-muted-foreground">{t("track.suggestLabel")}:</span>
          <button
            type="button"
            onClick={() => { setProjectId(suggestion.projectId); dismiss(); }}
            aria-label={t("track.suggestApply")}
            className="bg-purple-soft px-2.5 py-1 font-semibold text-heading transition-opacity hover:opacity-80"
          >
            {suggestion.projectName}
          </button>
          <button
            type="button"
            onClick={dismiss}
            aria-label={t("track.suggestDismiss")}
            className="px-1 text-muted-foreground transition-colors hover:text-ink"
          >
            ✕
          </button>
        </div>
      )}

      <ManualDialog
        open={manualOpen}
        onClose={() => setManualOpen(false)}
        projects={projects}
        defaultProjectId={projectId}
        onSave={saveManual}
      />

      <RatesDialog open={ratesOpen} onClose={() => setRatesOpen(false)} project={project} />
    </div>
  );
}
