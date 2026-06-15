import { useEffect, useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { useAppData } from "@/lib/data-context";
import { fmtClock, fmtMoney } from "@/lib/dashboard-metrics";
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
            No project
          </DropdownMenu.Item>
          {projects.map((p) => (
            <DropdownMenu.Item key={p.id} className={item} onSelect={() => onChange(p.id)}>
              {p.name}
            </DropdownMenu.Item>
          ))}
          {projects.length === 0 && (
            <span className="block px-3 py-2 text-md text-muted">No projects yet</span>
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
  const [projectId, setProjectId] = useState<string | null>(defaultProjectId);
  const [name, setName] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");

  const projectName = projects.find((p) => p.id === projectId)?.name ?? "No project";
  const seconds = (Number(hours) || 0) * 3600 + (Number(minutes) || 0) * 60;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (seconds <= 0) return;
    onSave(projectId, name, `${date}T09:00:00`, seconds);
    setName(""); setHours(""); setMinutes("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} title="Log time">
      <form onSubmit={submit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-md-minus text-muted">Project</span>
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
          <span className="text-md-minus text-muted">Task</span>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="What did you work on?" />
        </label>

        <div className="flex gap-3">
          <label className="flex flex-1 flex-col gap-1.5">
            <span className="text-md-minus text-muted">Date</span>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label className="flex w-20 flex-col gap-1.5">
            <span className="text-md-minus text-muted">Hours</span>
            <Input type="number" min="0" value={hours} onChange={(e) => setHours(e.target.value)} placeholder="0" />
          </label>
          <label className="flex w-20 flex-col gap-1.5">
            <span className="text-md-minus text-muted">Min</span>
            <Input type="number" min="0" max="59" value={minutes} onChange={(e) => setMinutes(e.target.value)} placeholder="0" />
          </label>
        </div>

        <div className="flex justify-end gap-2.5 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={seconds <= 0}>Save</Button>
        </div>
      </form>
    </Dialog>
  );
}

/** Tracking card — Figma 1:28. TRACKING label + project chip, 52px timer,
 *  $-chip + earned, Start/Stop + Manual. Left-column card: px-28 py-22. */
export function TrackingCard() {
  const {
    sessions, projects, settings, getProjectById, addSession,
    timerRunning, setTimerRunning,
    timerSeconds, setTimerSeconds,
    timerStartedAt, setTimerStartedAt,
    timerDescription, setTimerDescription,
  } = useAppData();
  const { toast } = useToast();

  const recent = sessions[0];
  const [projectId, setProjectId] = useState<string | null>(recent?.project_id ?? null);
  const [manualOpen, setManualOpen] = useState(false);

  const project = getProjectById(projectId);
  const projectName = project?.name ?? "Untracked";
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
        toast(`Saved ${fmtClock(duration)} to ${projectName}`, "success");
      } catch {
        toast("Failed to save session", "error");
      }
    }
    setTimerDescription("");
  };

  const saveManual = async (pid: string | null, name: string, dateISO: string, seconds: number) => {
    const proj = getProjectById(pid);
    try {
      await addSession(buildSession(proj, name, new Date(dateISO).getTime(), seconds, proj?.rate ?? settings?.default_rate ?? 0));
      toast(`Logged ${fmtClock(seconds)}`, "success");
    } catch {
      toast("Failed to log time", "error");
    }
  };

  return (
    <div className="flex flex-col gap-5 border border-line bg-card px-[28px] py-[22px] lg:flex-row lg:items-center lg:justify-between lg:gap-0">
      {/* Left: TRACKING label + project › task */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center gap-2">
          <span className={`size-[9px] ${timerRunning ? "bg-money" : "bg-track"}`} />
          <span className="text-sm font-medium tracking-[1.4px] text-muted">TRACKING</span>
        </div>
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
            placeholder="What are you working on?"
            className="min-w-[180px] bg-transparent text-base font-medium text-heading placeholder:font-normal placeholder:text-muted focus:outline-none"
          />
        </div>
      </div>

      {/* Center: live timer */}
      <span className="text-4xl font-bold tracking-[2px] text-heading tnum lg:text-hero">{fmtClock(timerSeconds)}</span>

      {/* Right: rate + earned, Start/Stop + Manual */}
      <div className="flex flex-col items-start gap-3 lg:items-end">
        <div className="flex items-center gap-2">
          <span className="bg-brand-soft px-[11px] py-1 text-sm font-semibold text-brand tnum">${rate}/hr</span>
          <span className="text-base font-semibold text-brand tnum">{fmtMoney(earned)} earned</span>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="unstyled"
            size="unstyled"
            onClick={timerRunning ? stop : start}
            className="bg-heading px-[30px] py-[11px] text-base font-semibold text-card"
          >
            {timerRunning ? "Stop" : "Start"}
          </Button>
          <Button
            variant="unstyled"
            size="unstyled"
            onClick={() => setManualOpen(true)}
            className="flex h-[40px] items-center justify-center border border-gray-300 bg-card px-[22px] text-md font-medium text-ink"
          >
            Manual
          </Button>
        </div>
      </div>

      <ManualDialog
        open={manualOpen}
        onClose={() => setManualOpen(false)}
        projects={projects}
        defaultProjectId={projectId}
        onSave={saveManual}
      />
    </div>
  );
}
