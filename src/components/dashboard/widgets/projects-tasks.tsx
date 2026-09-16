/** Projects & tasks — Figma 310:1434 (filled) / 310:1377 (empty).
 *  Accent = TIME (bold black time values).
 *  Left-column card: border #ececec, p-24, gap-16. */
import { Fragment, useState } from "react";
import { useRouter } from "next/navigation";
import { Folder, CircleDot, ChevronDown } from "lucide-react";
import { useDashboard } from "@/contexts/dashboard-context";
import { useAppData } from "@/contexts/data-context";
import { SessionEditDialog } from "@/components/shared/session-edit-dialog";
import { JiraAvatar } from "@/components/shared/jira-avatar";
import { useT } from "@/i18n";

function ProjectRow({
  pct, name, time, active, open, hasTasks, avatarUrl, onToggle,
}: {
  pct: string; name: string; time: string; active?: boolean;
  open: boolean; hasTasks: boolean; avatarUrl: string | null; onToggle: () => void;
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
        className={`app-press app-focus flex min-h-9 min-w-0 max-w-[260px] items-center gap-2 rounded-sm py-1.5 pl-2.5 pr-3 disabled:cursor-default ${active ? "bg-purple-soft hover:bg-purple-soft/70" : "bg-wash hover:bg-track"}`}
      >
        <JiraAvatar
          url={avatarUrl}
          alt=""
          fallback={<Folder className={`size-4 shrink-0 ${active ? "text-black" : "text-dark-2"}`} />}
        />
        <span className="line-clamp-1 min-w-0 text-base font-semibold text-heading">{name}</span>
        {hasTasks && (
          <ChevronDown className={`app-motion size-4 shrink-0 text-dark-2 ${open ? "" : "-rotate-90"}`} />
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
      className="app-press app-focus flex min-h-9 w-full items-center gap-3 rounded-sm pl-[40px] pr-2 text-left hover:bg-wash sm:pl-[56px]"
    >
      <CircleDot className="size-[18px] shrink-0 text-dark-2" />
      <span className="line-clamp-1 min-w-0 flex-1 text-base text-heading">{name}</span>
      <span className="shrink-0 text-md font-semibold text-ink tnum">{time}</span>
    </button>
  );
}

export function ProjectsTasks() {
  const { metrics } = useDashboard();
  const { setTimerRunning, setTimerStartedAt, setTimerSeconds, getProjectById } = useAppData();
  const t = useT();
  const router = useRouter();
  const { rows, empty } = metrics.projects;
  // null = closed; {projectId,name} = quick edit for one task. The ••• menu
  // now leads to the full /app/sessions page instead of a list dialog.
  const [dialog, setDialog] = useState<null | { projectId: string; name: string }>(null);
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
    <div className="flex flex-col gap-4 rounded-md bg-card p-6 shadow-sm">
      <div className="flex w-full items-center justify-between">
        <span className="text-widget font-semibold text-heading">{t("projects.title")}</span>
        <button onClick={() => router.push("/app/sessions")} aria-label={t("projects.manageSessions")} className="app-press app-focus flex size-9 items-center justify-center rounded-xs text-md font-bold text-muted-foreground hover:bg-wash hover:text-ink">•••</button>
      </div>
      {dialog && <SessionEditDialog open onClose={() => setDialog(null)} match={dialog} />}

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
            className="app-press app-focus flex items-center gap-2 rounded-sm bg-heading px-6 py-[11px] text-base font-semibold text-card shadow-xs hover:opacity-90"
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
              avatarUrl={getProjectById(p.id)?.jira_avatar_url ?? null}
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
