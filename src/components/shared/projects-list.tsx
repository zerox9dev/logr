"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { NewProjectDialog } from "@/components/dashboard/new-project-dialog";
import { NewClientDialog } from "@/components/dashboard/new-client-dialog";
import { RatesDialog } from "@/components/dashboard/rates-dialog";
import { useAppData } from "@/contexts/data-context";
import { useT } from "@/i18n";
import { fmtMoney } from "@/lib/format";
import type { Project, ProjectStatus } from "@/types/database";

const STATUS_LABEL_KEYS: Record<ProjectStatus, string> = {
  active: "projects.active",
  paused: "projects.paused",
  completed: "projects.completed",
  cancelled: "projects.cancelled",
};

const STATUS_CLASS: Record<ProjectStatus, string> = {
  active: "border-money/30 bg-brand-faint text-money",
  paused: "border-line text-muted-foreground",
  completed: "border-brand/30 bg-brand-soft text-brand",
  cancelled: "border-line text-muted-foreground",
};

/** Projects page body: name, client, billing/rate chip and status. A row opens
 *  the existing RatesDialog for a quick billing edit. "New project" falls back
 *  to the client dialog while there is no client to attach a project to. */
export function ProjectsList() {
  const { projects, loading, getClientById } = useAppData();
  const t = useT();
  const [dialog, setDialog] = useState<null | "project" | "client">(null);
  const [rateProject, setRateProject] = useState<Project | undefined>(undefined);

  return (
    <div className="min-w-0 flex-1 overflow-x-hidden bg-page px-4 py-4 lg:px-2">
      <div className="card-radius flex min-w-0 flex-col border border-line bg-card p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-widget font-semibold text-heading">{t("sidebar.projects")}</h1>
          <Button size="sm" onClick={() => setDialog("project")}>{t("new.newProject")}</Button>
        </div>

        {loading ? (
          <p className="py-8 text-center text-base text-muted-foreground">{t("common.loading")}</p>
        ) : projects.length === 0 ? (
          <p className="py-8 text-center text-base text-muted-foreground">{t("projects.noProjects")}</p>
        ) : (
          <div className="flex flex-col gap-px">
            {projects.map((p) => {
              const client = getClientById(p.client_id);
              const fixed = p.billing_type === "fixed";
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setRateProject(p)}
                  aria-label={`${t("rates.ratePrefix")}${p.name}`}
                  className="flex w-full flex-wrap items-center gap-3 border-b border-line py-2.5 text-left transition-colors last:border-0 hover:bg-wash"
                >
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="truncate text-md font-semibold text-heading">{p.name}</span>
                      <span className={`shrink-0 border px-1.5 py-px text-xs font-medium ${STATUS_CLASS[p.status]}`}>{t(STATUS_LABEL_KEYS[p.status])}</span>
                    </div>
                    <span className="truncate text-md-minus text-muted-foreground">
                      {client?.name ?? "—"} · {fixed ? t("projects.fixed") : t("projects.hourly")}
                    </span>
                  </div>
                  <span className="shrink-0 bg-page px-[11px] py-1 text-sm font-semibold text-dark-1 tnum">
                    {fixed
                      ? fmtMoney(p.fixed_budget ?? 0)
                      : `${p.rate ? `$${p.rate}` : "—"}${t("unit.perHr")}`}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <NewProjectDialog open={dialog === "project"} onClose={() => setDialog(null)} onNeedClient={() => setDialog("client")} />
      <NewClientDialog open={dialog === "client"} onClose={() => setDialog(null)} />
      <RatesDialog open={rateProject !== undefined} onClose={() => setRateProject(undefined)} project={rateProject} />
    </div>
  );
}
