import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { useAppData } from "@/contexts/data-context";
import { useT } from "@/i18n";
import { fmtClock, fmtMoney } from "@/lib/format";
import { ProjectPicker } from "@/components/shared/project-picker";
import { ManualDialog } from "@/components/dashboard/manual-entry-dialog";
import { RatesDialog } from "@/components/dashboard/rates-dialog";
import { useSessionSuggestion } from "@/hooks/use-session-suggestion";
import { resolveSessionRate } from "@/domain/employer";
import type { Project, SessionInsert } from "@/types/database";

/** Build a SessionInsert from a project + task + timing, baking in the rate
 *  that applies at creation time so every later aggregation reads it straight
 *  off the session. An employer client's salary-implied hourly rate wins over
 *  the project's own rate; otherwise the project rate, then the user default. */
function buildSession(
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

/** Tracking card — Figma 310:1501 (active) / 310:1208 (idle). Blinking dot +
 *  52px timer + rate/earned (rate chip opens the Rates manager), Start/Stop +
 *  Manual, project › task row. Idle at 00:00:00 greys the whole timer block. */
export function TrackingCard() {
  const {
    sessions, projects, settings, getProjectById, getClientById, addSession,
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

  /** Rate a session under this project would be logged at, salary first. */
  const rateFor = (p: Project | undefined) =>
    resolveSessionRate(getClientById(p?.client_id ?? null), p, settings);

  const project = getProjectById(projectId);
  const projectName = project?.name ?? t("track.selectProject");
  const rate = rateFor(project);
  const earned = (timerSeconds / 3600) * rate;
  // Zero state: nothing running and nothing on the clock — the whole
  // timer/rate/earned block drops to placeholder grey (Figma 310:1208).
  const idle = !timerRunning && timerSeconds === 0;

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
      await addSession(buildSession(proj, name, new Date(dateISO).getTime(), seconds, rateFor(proj)));
      toast(`${t("track.logged")} ${fmtClock(seconds)}`, "success");
    } catch {
      toast(t("track.logFailed"), "error");
    }
  };

  return (
    <div className="flex flex-col gap-2 rounded-md border border-line bg-card p-6">
      {/* Top row: timer-block (dot · timer / rate · earned) + actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span
            aria-hidden="true"
            className={`size-[9px] shrink-0 rounded-full ${timerRunning ? "animate-pulse bg-money motion-reduce:animate-none" : "bg-track"}`}
          />
          <span
            role="timer"
            aria-label={t("track.timerAriaLabel").replace("{time}", fmtClock(timerSeconds))}
            className={`text-4xl font-bold tracking-[2px] tnum lg:text-hero ${idle ? "text-placeholder" : "text-heading"}`}
          >
            {fmtClock(timerSeconds)}
          </span>
          <span className="sr-only">{timerRunning ? t("track.timerRunning") : t("track.timerStopped")}</span>
          <Button
            type="button"
            variant={idle ? "chip-muted" : "chip"}
            size="lg"
            onClick={() => setRatesOpen(true)}
            aria-label={t("rates.editAria")}
            title={t("rates.editAria")}
            className="text-sm font-semibold tnum"
          >
            {rate === 0 ? "—" : `$${Math.round(rate * 100) / 100}`}{t("unit.perHr")}
          </Button>
          <span className={`text-base font-semibold tnum ${idle ? "text-placeholder" : "text-dark-1"}`}>
            {fmtMoney(earned)} {t("track.earned")}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant={timerRunning ? "danger" : "success"}
            size="xl"
            onClick={timerRunning ? stop : start}
          >
            {timerRunning ? t("track.stop") : t("track.start")}
          </Button>
          <Button variant="surface" size="xl" onClick={() => setManualOpen(true)}>
            {t("track.manual")}
          </Button>
        </div>
      </div>

      {/* Bottom row: project › task */}
      <div className="flex flex-wrap items-center gap-2.5">
        <ProjectPicker
          onChange={setProjectId}
          projects={projects}
          trigger={
            <Button
              variant="accent"
              size="lg"
              aria-label={`${t("track.selectProject")}: ${projectName}`}
              className="max-w-[220px] gap-2"
            >
              <span aria-hidden="true" className="h-3 w-4 shrink-0 rounded-xs bg-black" />
              <span className="line-clamp-1 min-w-0 text-md font-semibold">{projectName}</span>
            </Button>
          }
        />
        <span aria-hidden="true" className="text-base text-muted-foreground">›</span>
        <Input
          variant="ghost"
          inputSize="lg"
          value={timerDescription}
          onChange={(e) => setTimerDescription(e.target.value)}
          placeholder={t("track.workingPlaceholder")}
          aria-label={t("track.workingPlaceholder")}
          className="min-w-[120px] flex-1"
        />
      </div>

      {/* Inline project suggestion — accept applies the project (and its
          rate/billing); ✕ dismisses it. Local history match, LLM fallback. */}
      {suggestion && (
        <div className="app-pop-in flex flex-wrap items-center gap-2 text-md">
          <span aria-hidden="true">✨</span>
          <span className="text-muted-foreground">{t("track.suggestLabel")}:</span>
          <Button
            type="button"
            variant="accent"
            size="lg"
            onClick={() => { setProjectId(suggestion.projectId); dismiss(); }}
            aria-label={t("track.suggestApply")}
            className="font-semibold"
          >
            {suggestion.projectName}
          </Button>
          <Button
            type="button"
            variant="ghost-muted"
            size="icon-lg"
            onClick={dismiss}
            aria-label={t("track.suggestDismiss")}
          >
            <X />
          </Button>
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
