/** Projects & tasks — Figma 310:1434 (filled) / 310:1377 (empty).
 *  Accent = TIME (bold black time values).
 *  Left-column card: border #ececec, p-24, gap-16. */
import { Fragment, useState } from "react";
import { Folder, CircleDot, ChevronDown } from "lucide-react";
import { useDashboard } from "@/contexts/dashboard-context";
import { useAppData } from "@/contexts/data-context";
import { SessionsDialog } from "@/components/shared/sessions-dialog";
import { useT } from "@/i18n";

function ProjectRow({
  pct, name, time, active, open, hasTasks, onToggle,
}: {
  pct: string; name: string; time: string; active?: boolean;
  open: boolean; hasTasks: boolean; onToggle: () => void;
}) {
  return (
    <div className="flex w-full items-center gap-3.5">
      <span className="w-[42px] shrink-0 text-base text-tertiary tnum">{pct}</span>
      {/* The chip hugs its label — the duration sits right after it rather than
          being pushed to the card edge (Figma 310:1434). */}
      <button
        onClick={onToggle}
        disabled={!hasTasks}
        aria-expanded={hasTasks ? open : undefined}
        className={`flex min-w-0 max-w-[260px] items-center gap-2 py-1.5 pl-2.5 pr-3 transition-colors ${active ? "bg-purple-soft" : "bg-wash"}`}
      >
        <Folder className={`size-4 shrink-0 ${active ? "text-black" : "text-dark-2"}`} />
        <span className="line-clamp-1 min-w-0 text-base font-semibold text-heading">{name}</span>
        {hasTasks && (
          <ChevronDown className={`size-4 shrink-0 text-dark-2 transition-transform ${open ? "" : "-rotate-90"}`} />
        )}
      </button>
      <span className="line-clamp-1 w-[96px] shrink-0 text-right text-base font-semibold text-ink tnum">{time}</span>
    </div>
  );
}

function TaskRow({ name, time, onClick }: { name: string; time: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 pl-[40px] text-left transition-colors hover:opacity-70 sm:pl-[56px]"
    >
      <CircleDot className="size-[18px] shrink-0 text-dark-2" />
      <span className="line-clamp-1 min-w-0 flex-1 text-base text-heading">{name}</span>
      <span className="shrink-0 text-md font-semibold text-ink tnum">{time}</span>
    </button>
  );
}

export function ProjectsTasks() {
  const { metrics } = useDashboard();
  const { setTimerRunning, setTimerStartedAt, setTimerSeconds } = useAppData();
  const t = useT();
  const { rows, empty } = metrics.projects;
  // null = closed; {} = all sessions (••• menu); {projectId,name} = one task.
  const [dialog, setDialog] = useState<null | { projectId?: string; name?: string }>(null);
  // Holds the rows whose state the user flipped away from the default (the top
  // project starts expanded, the rest collapsed). Storing the flip rather than
  // the open set keeps that default correct when rows arrive after mount.
  const [toggled, setToggled] = useState<Set<string>>(() => new Set());
  const toggle = (id: string) =>
    setToggled((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="card-radius flex flex-col gap-4 border border-line bg-card p-6">
      <div className="flex w-full items-center justify-between">
        <span className="text-widget font-semibold text-heading">{t("projects.title")}</span>
        <button onClick={() => setDialog({})} aria-label={t("projects.manageSessions")} className="text-md font-bold text-muted-foreground transition-colors">•••</button>
      </div>
      <SessionsDialog open={dialog !== null} onClose={() => setDialog(null)} match={dialog ?? undefined} />

      {empty && (
        <div className="flex w-full flex-col items-center justify-center gap-4 py-10">
          <span className="text-center text-base text-placeholder">{t("projects.empty")}</span>
          <button
            type="button"
            onClick={() => {
              setTimerStartedAt(Date.now());
              setTimerSeconds(0);
              setTimerRunning(true);
            }}
            className="flex items-center gap-2 bg-heading px-6 py-[11px] text-base font-semibold text-card transition-opacity hover:opacity-90"
          >
            <span aria-hidden="true">+</span>
            {t("projects.emptyCta")}
          </button>
        </div>
      )}

      {rows.map((p, i) => {
        const open = i === 0 ? !toggled.has(p.id) : toggled.has(p.id);
        return (
          <Fragment key={p.id}>
            <ProjectRow
              pct={p.pctLabel}
              name={p.name}
              time={p.timeLabel}
              active={i === 0}
              open={open}
              hasTasks={p.tasks.length > 0}
              onToggle={() => toggle(p.id)}
            />
            {open && p.tasks.map((t) => (
              <TaskRow
                key={t.name}
                name={t.name}
                time={t.timeLabel}
                onClick={() => setDialog({ projectId: p.id, name: t.name })}
              />
            ))}
            {open && p.tasks.length > 0 && i < rows.length - 1 && (
              <div className="h-px w-full bg-line" />
            )}
          </Fragment>
        );
      })}
    </div>
  );
}
