"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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

/** Projects page body: name, client, billing/rate chip and status. A row links
 *  to the project detail page; the rate chip stays a quick RatesDialog opener.
 *  "New project" falls back to the client dialog while there is no client to
 *  attach a project to. */
export function ProjectsList() {
  const { projects, loading, getClientById } = useAppData();
  const t = useT();
  const router = useRouter();
  const [dialog, setDialog] = useState<null | "project" | "client">(null);
  const [rateProject, setRateProject] = useState<Project | undefined>(undefined);

  return (
    <div className="min-w-0 flex-1 overflow-x-hidden bg-page px-4 py-4 lg:px-2">
      <div className="card-radius flex min-w-0 flex-col border border-line bg-card p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-widget font-semibold text-heading">{t("sidebar.projects")}</h1>
          <Button size="sm" onClick={() => setDialog("project")}>{t("new.newProject")}</Button>
        </div>

        <Table className="min-w-[640px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-md-minus text-muted-foreground">{t("projects.name")}</TableHead>
              <TableHead className="text-md-minus text-muted-foreground">{t("projects.client")}</TableHead>
              <TableHead className="text-md-minus text-muted-foreground">{t("projects.billing")}</TableHead>
              <TableHead className="text-right text-md-minus text-muted-foreground">{t("table.rateBudget")}</TableHead>
              <TableHead className="text-md-minus text-muted-foreground">{t("table.status")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading || projects.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5} className="py-8 text-center text-base text-muted-foreground">
                  {loading ? t("common.loading") : t("projects.noProjects")}
                </TableCell>
              </TableRow>
            ) : (
              projects.map((p) => {
                const client = getClientById(p.client_id);
                const fixed = p.billing_type === "fixed";
                return (
                  <TableRow
                    key={p.id}
                    onClick={() => router.push(`/app/projects/${p.id}`)}
                    className="cursor-pointer border-line hover:bg-wash"
                  >
                    <TableCell className="py-2.5">
                      <Link
                        href={`/app/projects/${p.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-md font-semibold text-heading"
                      >
                        {p.name}
                      </Link>
                    </TableCell>
                    <TableCell className="py-2.5 text-md-minus text-muted-foreground">{client?.name ?? "—"}</TableCell>
                    <TableCell className="py-2.5 text-md-minus text-muted-foreground">
                      {fixed ? t("projects.fixed") : t("projects.hourly")}
                    </TableCell>
                    <TableCell className="py-2.5 text-right">
                      <button
                        type="button"
                        aria-label={`${t("rates.ratePrefix")}${p.name}`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setRateProject(p);
                        }}
                        className="bg-page px-[11px] py-1 text-sm font-semibold text-dark-1 transition-colors tnum hover:bg-wash"
                      >
                        {fixed
                          ? fmtMoney(p.fixed_budget ?? 0)
                          : `${p.rate ? `$${p.rate}` : "—"}${t("unit.perHr")}`}
                      </button>
                    </TableCell>
                    <TableCell className="py-2.5">
                      <span className={`border px-1.5 py-px text-xs font-medium ${STATUS_CLASS[p.status]}`}>
                        {t(STATUS_LABEL_KEYS[p.status])}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <NewProjectDialog open={dialog === "project"} onClose={() => setDialog(null)} onNeedClient={() => setDialog("client")} />
      <NewClientDialog open={dialog === "client"} onClose={() => setDialog(null)} />
      <RatesDialog open={rateProject !== undefined} onClose={() => setRateProject(undefined)} project={rateProject} />
    </div>
  );
}
