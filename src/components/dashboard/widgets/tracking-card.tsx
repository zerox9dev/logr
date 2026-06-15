import { useEffect, useState, type FormEvent } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { useAppData } from "@/lib/data-context";
import { useT } from "@/lib/i18n";
import { fmtClock, fmtMoney } from "@/lib/dashboard-metrics";
import type { BillingType, Project, SessionInsert } from "@/types/database";

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
    started_at: new Date(startedAtMs).toISOString(),
    duration_seconds: durationSeconds,
    rate: project?.rate ?? defaultRate,
    billing_type: project?.billing_type ?? "hourly",
    payment_status: "unpaid",
  };
}

/** Project picker — Radix DropdownMenu listing all projects (+ "No project"). */
function ProjectPicker({
  onChange, projects, trigger,
}: {
  onChange: (id: string | null) => void;
  projects: Project[];
  trigger: React.ReactNode;
}) {
  const t = useT();
  const item = "cursor-pointer truncate px-3 py-2 text-md text-ink outline-none data-[highlighted]:bg-wash";
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={6}
          className="z-50 max-h-[260px] min-w-[200px] max-w-[280px] overflow-auto border border-line bg-card py-1 shadow-[0px_8px_30px_0px_rgba(0,0,0,0.12)]"
        >
          <DropdownMenu.Item className={item} onSelect={() => onChange(null)}>
            {t("track.noProject")}
          </DropdownMenu.Item>
          {projects.map((p) => (
            <DropdownMenu.Item key={p.id} className={item} onSelect={() => onChange(p.id)}>
              {p.name}
            </DropdownMenu.Item>
          ))}
          {projects.length === 0 && (
            <span className="block px-3 py-2 text-md text-muted">{t("track.noProjectsYet")}</span>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

/** Manual time-entry dialog — log a past session without the live timer. */
function ManualDialog({
  open, onClose, projects, defaultProjectId, onSave,
}: {
  open: boolean;
  onClose: () => void;
  projects: Project[];
  defaultProjectId: string | null;
  onSave: (projectId: string | null, name: string, dateISO: string, seconds: number) => void;
}) {
  const t = useT();
  const [projectId, setProjectId] = useState<string | null>(defaultProjectId);
  const [name, setName] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");

  const projectName = projects.find((p) => p.id === projectId)?.name ?? t("track.noProject");
  const seconds = (Number(hours) || 0) * 3600 + (Number(minutes) || 0) * 60;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (seconds <= 0) return;
    onSave(projectId, name, `${date}T09:00:00`, seconds);
    setName(""); setHours(""); setMinutes("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} title={t("manual.title")}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-md-minus text-muted">{t("manual.project")}</span>
          <ProjectPicker
            onChange={setProjectId}
            projects={projects}
            trigger={
              <Button type="button" variant="outline" size="default" className="w-full justify-between">
                <span className="line-clamp-1 min-w-0">{projectName}</span>
                <span aria-hidden="true" className="shrink-0 text-muted">▾</span>
              </Button>
            }
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-md-minus text-muted">{t("manual.task")}</span>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("manual.taskPlaceholder")} />
        </label>

        <div className="flex gap-3">
          <label className="flex flex-1 flex-col gap-1.5">
            <span className="text-md-minus text-muted">{t("manual.date")}</span>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label className="flex w-20 flex-col gap-1.5">
            <span className="text-md-minus text-muted">{t("manual.hours")}</span>
            <Input type="number" min="0" value={hours} onChange={(e) => setHours(e.target.value)} placeholder="0" />
          </label>
          <label className="flex w-20 flex-col gap-1.5">
            <span className="text-md-minus text-muted">{t("manual.min")}</span>
            <Input type="number" min="0" max="59" value={minutes} onChange={(e) => setMinutes(e.target.value)} placeholder="0" />
          </label>
        </div>

        <div className="flex justify-end gap-2.5 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>{t("manual.cancel")}</Button>
          <Button type="submit" disabled={seconds <= 0}>{t("manual.save")}</Button>
        </div>
      </form>
    </Dialog>
  );
}

const seg = (active: boolean) =>
  `px-3 py-1.5 text-md-minus font-medium ${active ? "bg-card text-heading shadow-[0px_1px_4px_0px_rgba(0,0,0,0.08)]" : "text-dark-3"}`;

/** Rate editor for the currently-selected project (billing + rate / budget).
 *  When no project is selected, edits the user's default hourly rate.
 *  Mounted fresh per open (no reset effect). */
function RatesForm({ project, onClose }: { project: Project | undefined; onClose: () => void }) {
  const { settings, updateSettings, updateProject } = useAppData();
  const { toast } = useToast();
  const t = useT();
  const [billing, setBilling] = useState<BillingType>(project?.billing_type ?? "hourly");
  const [value, setValue] = useState(
    project
      ? String((project.billing_type === "fixed" ? project.fixed_budget : project.rate) ?? "")
      : String(settings?.default_rate ?? ""),
  );
  const [saving, setSaving] = useState(false);
  const fixed = billing === "fixed";

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      const num = Number(value) || 0;
      if (project) {
        await updateProject(project.id, {
          billing_type: billing,
          rate: fixed ? null : num,
          fixed_budget: fixed ? num : null,
        });
      } else {
        await updateSettings({ default_rate: num });
      }
      toast(t("rates.updated"), "success");
      onClose();
    } catch {
      toast(t("rates.updateFailed"), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      {project ? (
        <>
          <div className="flex flex-col gap-1.5">
            <span className="text-md-minus text-muted">{t("rates.billing")}</span>
            <div className="flex w-fit items-start bg-wash p-1">
              <button type="button" className={seg(!fixed)} onClick={() => setBilling("hourly")}>{t("rates.hourly")}</button>
              <button type="button" className={seg(fixed)} onClick={() => setBilling("fixed")}>{t("rates.fixed")}</button>
            </div>
          </div>
          <label className="flex flex-col gap-1.5">
            <span className="text-md-minus text-muted">{fixed ? t("rates.budget") : t("rates.rate")}</span>
            <Input type="number" min="0" value={value} onChange={(e) => setValue(e.target.value)} placeholder="0" autoFocus />
          </label>
        </>
      ) : (
        <label className="flex flex-col gap-1.5">
          <span className="text-md-minus text-muted">{t("rates.defaultRateField")}</span>
          <Input type="number" min="0" value={value} onChange={(e) => setValue(e.target.value)} placeholder="0" autoFocus />
          <span className="text-sm text-muted">{t("rates.noProjectHint")}</span>
        </label>
      )}

      <div className="flex justify-end gap-2.5 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>{t("rates.cancel")}</Button>
        <Button type="submit" disabled={saving}>{t("rates.save")}</Button>
      </div>
    </form>
  );
}

function RatesDialog({ open, onClose, project }: { open: boolean; onClose: () => void; project: Project | undefined }) {
  const t = useT();
  return (
    <Dialog open={open} onClose={onClose} title={project ? `${t("rates.ratePrefix")}${project.name}` : t("rates.defaultRate")}>
      {open && <RatesForm project={project} onClose={onClose} />}
    </Dialog>
  );
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
    setTimerStartedAt(null);
    setTimerSeconds(0);
    if (duration >= 1) {
      try {
        await addSession(buildSession(project, timerDescription, startedAt, duration, rate));
        toast(`${t("track.saved")} ${fmtClock(duration)} ${t("track.savedTo")} ${projectName}`, "success");
      } catch {
        toast(t("track.saveFailed"), "error");
      }
    }
    setTimerDescription("");
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
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span
            aria-hidden="true"
            className={`size-[9px] shrink-0 rounded-full ${timerRunning ? "animate-pulse bg-money" : "bg-track"}`}
          />
          <span className="text-4xl font-bold tracking-[2px] text-heading tnum lg:text-hero">{fmtClock(timerSeconds)}</span>
          <button
            type="button"
            onClick={() => setRatesOpen(true)}
            aria-label={t("rates.editAria")}
            className="bg-brand-soft px-[11px] py-1 text-sm font-semibold text-brand tnum transition-opacity hover:opacity-80"
          >
            ${rate}{t("unit.perHr")}
          </button>
          <span className="text-base font-semibold text-brand tnum">{fmtMoney(earned)} {t("track.earned")}</span>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="unstyled"
            size="unstyled"
            onClick={timerRunning ? stop : start}
            className={`px-[30px] py-[11px] text-base font-semibold text-card transition-colors ${
              timerRunning ? "bg-red-600 hover:bg-red-700" : "bg-money hover:opacity-90"
            }`}
          >
            {timerRunning ? t("track.stop") : t("track.start")}
          </Button>
          <Button
            variant="unstyled"
            size="unstyled"
            onClick={() => setManualOpen(true)}
            className="flex h-[40px] items-center justify-center border border-gray-300 bg-card px-[22px] text-md font-medium text-ink"
          >
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
            <Button variant="unstyled" size="unstyled" className="flex max-w-[220px] items-center gap-2 bg-purple-soft py-1.5 pl-2.5 pr-3">
              <span aria-hidden="true" className="h-3 w-4 shrink-0 bg-black" />
              <span className="line-clamp-1 min-w-0 text-md font-semibold text-heading">{projectName}</span>
            </Button>
          }
        />
        <span aria-hidden="true" className="text-base text-muted">›</span>
        <input
          value={timerDescription}
          onChange={(e) => setTimerDescription(e.target.value)}
          placeholder={t("track.workingPlaceholder")}
          className="min-w-[180px] bg-transparent text-base font-medium text-heading placeholder:font-normal placeholder:text-muted focus:outline-none"
        />
      </div>

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
