"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RatesDialog } from "@/components/dashboard/rates-dialog";
import { JiraAvatar } from "@/components/shared/jira-avatar";
import { useAppData } from "@/contexts/data-context";
import { useT, useLang } from "@/i18n";
import { fmtDuration, fmtDurationFull, fmtMoney } from "@/lib/format";
import type { ProjectStatus } from "@/types/database";

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

/** Project detail: header with the linked client and billing, all-time stats
 *  for this project only, and its session history (read-only — sessions keep
 *  their own CRUD page). */
export function ProjectDetail({ id }: { id: string }) {
  const { loading, getProjectById, getClientById, sessions } = useAppData();
  const t = useT();
  const { lang } = useLang();
  const [rateOpen, setRateOpen] = useState(false);

  const project = getProjectById(id);

  if (loading || !project) {
    return (
      <div className="min-w-0 flex-1 overflow-x-hidden bg-page px-4 py-4 lg:px-2">
        <div className="card-radius flex min-w-0 flex-col border border-line bg-card p-6">
          <p className="py-8 text-center text-base text-muted-foreground">
            {loading ? t("common.loading") : t("projectDetail.notFound")}
          </p>
        </div>
      </div>
    );
  }

  const client = getClientById(project.client_id);
  const fixed = project.billing_type === "fixed";
  const units = { hr: t("unit.hr"), min: t("unit.min") };

  const rows = sessions
    .filter((s) => s.project_id === id)
    .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());

  const amountOf = (seconds: number, rate: number) => (seconds / 3600) * (rate || 0);

  const totalSeconds = rows.reduce((sum, s) => sum + s.duration_seconds, 0);
  const billed = rows
    .filter((s) => s.payment_status === "paid")
    .reduce((sum, s) => sum + amountOf(s.duration_seconds, s.rate), 0);
  const unbilled = rows
    .filter((s) => s.payment_status !== "paid")
    .reduce((sum, s) => sum + amountOf(s.duration_seconds, s.rate), 0);

  const stat = (label: string, value: string, tone: string) => (
    <div className="flex min-w-[140px] flex-1 flex-col gap-1 border border-line bg-wash p-4">
      <span className="text-md-minus text-muted-foreground">{label}</span>
      <span className={`text-base font-semibold tnum ${tone}`}>{value}</span>
    </div>
  );

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4 overflow-x-hidden bg-page px-4 py-4 lg:px-2">
      <div className="card-radius flex min-w-0 flex-col border border-line bg-card p-6">
        <Link href="/app/projects" className="text-md-minus text-muted-foreground transition-colors hover:text-ink">
          ← {t("sidebar.projects")}
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <JiraAvatar url={project.jira_avatar_url} alt="" className="size-6" />
            <h1 className="min-w-0 truncate text-widget font-semibold text-heading">{project.name}</h1>
            <span className={`shrink-0 border px-1.5 py-px text-xs font-medium ${STATUS_CLASS[project.status]}`}>
              {t(STATUS_LABEL_KEYS[project.status])}
            </span>
          </div>
          <Button size="sm" variant="outline" onClick={() => setRateOpen(true)}>
            {t("projectDetail.editRate")}
          </Button>
        </div>
        <p className="mt-1 flex flex-wrap items-center gap-1.5 text-md text-muted-foreground">
          {client ? (
            <Link href={`/app/clients/${client.id}`} className="font-medium text-heading transition-colors hover:text-brand">
              {client.name}
            </Link>
          ) : (
            <span>—</span>
          )}
          <span>·</span>
          <span>{fixed ? t("projects.fixed") : t("projects.hourly")}</span>
          <span>·</span>
          <span className="font-semibold text-dark-1 tnum">
            {fixed
              ? fmtMoney(project.fixed_budget ?? 0)
              : `${project.rate ? `$${project.rate}` : "—"}${t("unit.perHr")}`}
          </span>
        </p>
      </div>

      <div className="card-radius flex min-w-0 flex-wrap gap-3 border border-line bg-card p-6">
        {stat(t("projectDetail.totalTracked"), fmtDurationFull(totalSeconds, units), "text-heading")}
        {stat(t("projectDetail.billed"), fmtMoney(billed), "text-money")}
        {stat(t("projectDetail.unbilled"), fmtMoney(unbilled), "text-heading")}
      </div>

      <div className="card-radius flex min-w-0 flex-col overflow-x-auto border border-line bg-card p-6">
        <h2 className="mb-4 text-base font-semibold text-heading">{t("projectDetail.sessionHistory")}</h2>
        {rows.length === 0 ? (
          <p className="py-4 text-md text-muted-foreground">{t("projectDetail.noSessions")}</p>
        ) : (
          <div className="flex min-w-[600px] flex-col gap-px">
            {rows.map((s) => {
              const paid = s.payment_status === "paid";
              const amount = amountOf(s.duration_seconds, s.rate);
              return (
                <div key={s.id} className="flex items-center gap-3 border-b border-line py-2.5 last:border-0">
                  <span className="w-[88px] shrink-0 text-md-minus text-muted-foreground tnum">
                    {new Date(s.started_at).toLocaleDateString(lang, { month: "short", day: "numeric" })}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-md font-medium text-heading">{s.name}</span>
                  <span className="w-[72px] shrink-0 text-md-minus text-muted-foreground">
                    {s.billing_type === "fixed" ? t("projects.fixed") : t("projects.hourly")}
                  </span>
                  <span className="w-[88px] shrink-0 text-right text-md text-tertiary tnum">
                    {fmtDuration(s.duration_seconds, units)}
                  </span>
                  <span className={`w-[72px] shrink-0 text-right text-md font-semibold tnum ${amount > 0 ? "text-money" : "text-muted-foreground"}`}>
                    {amount > 0 ? fmtMoney(amount) : "—"}
                  </span>
                  <span className={`w-[84px] shrink-0 border px-2 py-1 text-center text-sm font-medium ${paid ? "border-money/30 bg-brand-faint text-money" : "border-line text-tertiary"}`}>
                    {paid ? t("sessions.paid") : t("dash.unpaid")}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <RatesDialog open={rateOpen} onClose={() => setRateOpen(false)} project={project} />
    </div>
  );
}
