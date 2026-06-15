/** Projects & tasks — Figma 1:99. Accent = TIME (bold black time values).
 *  Left-column card: border #ececec, px-26 pt-22 pb-26, gap-16. */
import { Fragment, useState } from "react";
import { Folder, CircleDot, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDashboard } from "@/components/dashboard/dashboard-context";
import { SessionsDialog } from "@/components/dashboard/sessions-dialog";

function ProjectRow({
  pct, name, time, active, open, hasTasks, onToggle,
}: {
  pct: string; name: string; time: string; active?: boolean;
  open: boolean; hasTasks: boolean; onToggle: () => void;
}) {
  return (
    <div className="flex w-full items-center gap-3.5">
      <span className="w-[42px] text-base text-tertiary tnum">{pct}</span>
      <Button
        variant="unstyled"
        size="unstyled"
        onClick={onToggle}
        disabled={!hasTasks}
        aria-expanded={hasTasks ? open : undefined}
        className={`flex max-w-[200px] items-center gap-2 py-1.5 pl-2.5 pr-3 ${active ? "bg-purple-soft" : "bg-wash"}`}
      >
        <Folder className={`size-4 shrink-0 ${active ? "text-black" : "text-dark-2"}`} />
        <span className="line-clamp-1 min-w-0 text-base font-semibold text-heading">{name}</span>
        {hasTasks && (
          <ChevronDown className={`size-4 shrink-0 text-dark-2 transition-transform ${open ? "" : "-rotate-90"}`} />
        )}
      </Button>
      <div className="h-[5px] min-w-px flex-1" />
      <span className="line-clamp-1 w-[96px] text-right text-base font-semibold text-ink tnum">{time}</span>
    </div>
  );
}

function TaskRow({ name, time, onClick }: { name: string; time: string; onClick: () => void }) {
  return (
    <Button
      variant="unstyled"
      size="unstyled"
      onClick={onClick}
      className="flex w-full items-center gap-3 pl-[56px] text-left hover:opacity-70"
    >
      <CircleDot className="size-[18px] shrink-0 text-dark-2" />
      <span className="line-clamp-1 min-w-0 flex-1 text-base text-heading">{name}</span>
      <span className="shrink-0 text-md font-semibold text-ink tnum">{time}</span>
    </Button>
  );
}

export function ProjectsTasks() {
  const { metrics } = useDashboard();
  const { rows, empty } = metrics.projects;
  // null = closed; {} = all sessions (••• menu); {projectId,name} = one task.
  const [dialog, setDialog] = useState<null | { projectId?: string; name?: string }>(null);
  // Set of expanded project ids; seeded with the top project so it starts open.
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(rows[0] ? [rows[0].id] : []));
  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="flex flex-col gap-4 border border-line bg-card px-[26px] pb-[26px] pt-[22px]">
      <div className="flex w-full items-center justify-between">
        <span className="text-widget font-semibold text-heading">Projects &amp; tasks</span>
        <Button variant="unstyled" size="unstyled" onClick={() => setDialog({})} aria-label="Manage sessions" className="text-md font-bold text-muted">•••</Button>
      </div>
      <SessionsDialog open={dialog !== null} onClose={() => setDialog(null)} match={dialog ?? undefined} />

      {empty && <span className="text-base text-muted">No tracked time in this period.</span>}

      {rows.map((p, i) => {
        const open = expanded.has(p.id);
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
          </Fragment>
        );
      })}
    </div>
  );
}
