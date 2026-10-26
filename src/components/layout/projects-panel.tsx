"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { NewClientDialog } from "@/components/dashboard/new-client-dialog";
import { NewProjectDialog } from "@/components/dashboard/new-project-dialog";
import { useAppData } from "@/contexts/data-context";
import { useTracker } from "@/contexts/tracker-context";
import { useT } from "@/i18n";
import { useMinuteClock } from "@/hooks/use-minute-clock";
import { fmtDurationCompact, fmtMoney } from "@/lib/format";
import { projectToneStyle } from "@/lib/project-tone";
import { trackedTotals, type Totals } from "@/domain/tracking";
import type { Project } from "@/types/database";

/** Today's and this week's totals, the running timer included. The minute
 *  clock rolls "today" over at midnight even when nothing else changes. */
function useTotals() {
  const { sessions } = useAppData();
  const { running, seconds, projectId, rate } = useTracker();
  const minute = useMinuteClock();
  return useMemo(
    () => trackedTotals(sessions, running ? new Date() : minute, running ? { projectId, seconds, rate } : undefined),
    [sessions, running, seconds, projectId, rate, minute],
  );
}

function ProjectRow({ project, totals, selected, live, onSelect }: {
  project: Project | null;
  totals: Totals | undefined;
  selected: boolean;
  live: boolean;
  onSelect: () => void;
}) {
  const t = useT();
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`app-focus group flex h-8 w-full cursor-pointer items-center gap-2.5 rounded-md px-2 text-left text-[13px] transition-colors ${
        selected ? "bg-sidebar-accent text-heading" : "text-ink hover:bg-wash"
      }`}
    >
      <span
        aria-hidden="true"
        style={projectToneStyle(project?.id)}
        className={`size-2.5 shrink-0 rounded-full bg-(--bar) ${live ? "animate-pulse motion-reduce:animate-none" : ""}`}
      />
      <span className="min-w-0 flex-1 truncate">{project?.name ?? t("panel.noProject")}</span>
      {totals?.today ? (
        <span className="text-[11.5px] text-tertiary tnum">{fmtDurationCompact(totals.today)}</span>
      ) : null}
    </button>
  );
}

/**
 * The projects panel beside the calendar, after the canon's tasks panel:
 * projects grouped by client, today's time against each, and the one being
 * tracked highlighted. Picking a row points the timer at that project.
 */
export function ProjectsPanel() {
  const { projects, clients, loading } = useAppData();
  const tracker = useTracker();
  const t = useT();
  const { byProject, today, week, weekEarned } = useTotals();
  const [dialog, setDialog] = useState<null | "project" | "client">(null);

  const groups = useMemo(() => {
    const active = projects.filter((p) => p.status === "active" || p.id === tracker.projectId);
    const byClient = new Map<string, Project[]>();
    for (const p of active) {
      const key = p.client_id ?? "";
      byClient.set(key, [...(byClient.get(key) ?? []), p]);
    }
    return [...byClient.entries()]
      .map(([clientId, list]) => ({
        clientId,
        name: clients.find((c) => c.id === clientId)?.name ?? "",
        projects: list.sort((a, b) => a.name.localeCompare(b.name)),
      }))
      .sort((a, b) => (a.name && b.name ? a.name.localeCompare(b.name) : a.name ? -1 : 1));
  }, [projects, clients, tracker.projectId]);

  return (
    <aside
      aria-label={t("panel.title")}
      className="app-chrome flex w-[272px] shrink-0 flex-col border-r border-line max-lg:hidden"
    >
      <div className="flex h-11 shrink-0 items-center justify-between px-4">
        <h2 className="text-[13px] font-semibold text-heading">{t("panel.title")}</h2>
        <button
          type="button"
          onClick={() => setDialog("project")}
          aria-label={t("panel.newProject")}
          title={t("panel.newProject")}
          className="app-focus flex size-7 items-center justify-center rounded-md text-tertiary transition-colors hover:bg-wash hover:text-heading"
        >
          <Plus className="size-4" aria-hidden="true" />
        </button>
      </div>

      <div className="cal-scroll flex-1 overflow-y-auto px-2 pb-3">
        {groups.length === 0 ? (
          <p className="px-2 py-3 text-[13px] text-tertiary">{t("panel.empty")}</p>
        ) : (
          groups.map((g) => (
            <section key={g.clientId} className="mt-2 first:mt-0">
              {g.name ? (
                <h3 className="px-2 pt-2 pb-1 text-[11.5px] font-medium text-tertiary">{g.name}</h3>
              ) : null}
              {g.projects.map((p) => (
                <ProjectRow
                  key={p.id}
                  project={p}
                  totals={byProject.get(p.id)}
                  selected={tracker.projectId === p.id}
                  live={tracker.running && tracker.projectId === p.id}
                  onSelect={() => tracker.setProjectId(p.id)}
                />
              ))}
            </section>
          ))
        )}
        <div className="mt-2">
          <ProjectRow
            project={null}
            totals={byProject.get("")}
            selected={tracker.projectId === null}
            live={tracker.running && tracker.projectId === null}
            onSelect={() => tracker.setProjectId(null)}
          />
        </div>
      </div>

      {/* Totals wait for the data: rendered on the server they would format
          money in the server's locale and mismatch on hydration. */}
      <dl className={`grid shrink-0 grid-cols-2 gap-3 border-t border-line px-4 py-3 ${loading ? "invisible" : ""}`}>
        <div>
          <dt className="text-[11.5px] text-tertiary">{t("panel.today")}</dt>
          <dd className="mt-0.5 text-[15px] font-semibold text-heading tnum">{loading ? "" : fmtDurationCompact(today)}</dd>
        </div>
        <div>
          <dt className="text-[11.5px] text-tertiary">{t("panel.week")}</dt>
          <dd className="mt-0.5 text-[15px] font-semibold text-heading tnum">{loading ? "" : fmtDurationCompact(week)}</dd>
          <dd className="text-[11.5px] text-money tnum">{loading ? "" : fmtMoney(weekEarned)}</dd>
        </div>
      </dl>

      <NewProjectDialog open={dialog === "project"} onClose={() => setDialog(null)} onNeedClient={() => setDialog("client")} />
      <NewClientDialog open={dialog === "client"} onClose={() => setDialog(null)} />
    </aside>
  );
}
