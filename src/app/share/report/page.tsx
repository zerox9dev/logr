"use client";

import { Suspense, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BarChart3, Clock3, DollarSign, ExternalLink, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  decodeSharedReport,
  type ReportBreakdownItem,
} from "@/domain/report-share";
import { fmtDurationCompact as formatDuration, getCurrencySymbol } from "@/lib/format";
import { useT } from "@/i18n";

function formatReportDate(iso: string): string {
  return new Date(iso).toLocaleDateString([], { year: "numeric", month: "short", day: "numeric" });
}

function BreakdownList({
  title,
  items,
}: {
  title: string;
  items: ReportBreakdownItem[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-md text-muted-foreground">No tracked work in this report.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {items.map((item, index) => (
              <div key={`${item.name}-${index}`} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-md">
                  <span className="font-medium text-ink">{item.name}</span>
                  <span className="text-md-minus text-muted-foreground tnum">{formatDuration(item.durationSeconds)}</span>
                </div>
                <div className="h-1.5 w-full bg-track">
                  <div
                    className="h-1.5 bg-brand"
                    style={{ width: `${(item.durationSeconds / (items[0]?.durationSeconds || 1)) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ReportView() {
  const searchParams = useSearchParams();
  const payload = useMemo(() => decodeSharedReport(searchParams.get("data") || ""), [searchParams]);
  const t = useT();

  if (!payload) {
    return (
      <div className="min-h-screen bg-page px-5 pb-16 pt-8">
        <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-6">
          <Card>
            <CardContent className="flex min-h-[60vh] flex-col items-center justify-center gap-3.5 p-8 text-center">
              <BarChart3 className="h-[42px] w-[42px] text-tertiary" />
              <h1 className="text-5xl font-extrabold tracking-tight text-heading">{t("reports.invalidLink")}</h1>
              <p className="text-base text-muted-foreground">{t("reports.invalidLinkHint")}</p>
              <Link
                href="/"
                className="inline-flex h-9 items-center justify-center gap-2 bg-ink px-4 text-md font-medium text-white transition-opacity hover:opacity-85"
              >
                {t("reports.openLogr")}
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currencySymbol = getCurrencySymbol(payload.currency);
  const generatedAt = new Date(payload.generatedAt);
  const reportTitle = payload.clientName
    ? t("reports.hoursAndEarningsForClient").replace("{client}", payload.clientName)
    : t("reports.hoursAndEarningsGeneric");

  return (
    <div className="min-h-screen bg-page px-5 pb-16 pt-8">
      <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-6">
        <Card>
          <CardContent className="flex flex-col gap-6 p-7">
            <div className="w-fit border border-line bg-brand-soft px-2.5 py-1.5 text-sm font-bold uppercase tracking-wide text-brand">
              {t("reports.sharedWorkReport")}
            </div>
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row">
              <div>
                <h1 className="text-5xl font-extrabold leading-none tracking-tight text-heading">{reportTitle}</h1>
                <p className="mt-2.5 max-w-[720px] text-base text-muted-foreground">
                  {t("reports.reportingPeriod")} <strong className="text-ink">{payload.range}</strong>.
                  {payload.clientName ? <> {t("reports.clientLabel")} <strong className="text-ink">{payload.clientName}</strong>.</> : null}{" "}
                  {t("reports.generatedOn")}{" "}
                  <strong className="text-ink">{generatedAt.toLocaleDateString()}</strong>.
                </p>
              </div>
              <Link
                href="/"
                className="inline-flex h-9 shrink-0 items-center justify-center gap-2 border border-line bg-card px-4 text-md font-medium text-ink transition-colors hover:bg-wash"
              >
                {t("reports.openLogr")}
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
              <div className="flex flex-col gap-2.5 border border-line bg-card p-[18px]">
                <span className="inline-flex items-center gap-2 text-md-minus font-semibold text-muted-foreground"><Clock3 className="h-3.5 w-3.5" /> {t("reports.totalTime")}</span>
                <strong className="text-5xl leading-none tracking-tight text-ink tnum">{formatDuration(payload.totalSeconds)}</strong>
              </div>
              <div className="flex flex-col gap-2.5 border border-line bg-card p-[18px]">
                <span className="inline-flex items-center gap-2 text-md-minus font-semibold text-muted-foreground"><BarChart3 className="h-3.5 w-3.5" /> {t("reports.billable")}</span>
                <strong className="text-5xl leading-none tracking-tight text-ink tnum">{formatDuration(payload.billableSeconds)}</strong>
              </div>
              <div className="flex flex-col gap-2.5 border border-line bg-card p-[18px]">
                <span className="inline-flex items-center gap-2 text-md-minus font-semibold text-muted-foreground"><DollarSign className="h-3.5 w-3.5" /> {t("reports.earnings")}</span>
                <strong className="text-5xl leading-none tracking-tight text-brand tnum">{currencySymbol}{payload.billableAmount.toFixed(2)}</strong>
              </div>
              <div className="flex flex-col gap-2.5 border border-line bg-card p-[18px]">
                <span className="inline-flex items-center gap-2 text-md-minus font-semibold text-muted-foreground"><Wallet className="h-3.5 w-3.5" /> {t("reports.paid")}</span>
                <strong className="text-5xl leading-none tracking-tight text-brand tnum">{currencySymbol}{payload.paidAmount.toFixed(2)}</strong>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <BreakdownList title={t("reports.byProject")} items={payload.topProjects} />
          <BreakdownList title={t("reports.byClient")} items={payload.topClients} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("reports.workLog")}</CardTitle>
          </CardHeader>
          <CardContent>
            {payload.sessions.length === 0 ? (
              <p className="text-md text-muted-foreground">{t("reports.noTrackedWork")}</p>
            ) : (
              <div className="flex flex-col gap-3">
                {payload.sessions.map((session) => (
                  <article key={session.id} className="border border-line bg-card p-[18px]">
                    <div className="flex flex-col items-start justify-between gap-3 md:flex-row">
                      <div>
                        <h3 className="text-lg font-bold text-heading">{session.name}</h3>
                        <p className="mt-1 text-md-minus text-muted-foreground">
                          {session.projectName} • {formatReportDate(session.startedAt)}
                        </p>
                      </div>
                      <Badge variant={session.paymentStatus === "paid" ? "default" : "secondary"}>
                        {session.paymentStatus}
                      </Badge>
                    </div>
                    <div className="mt-3.5 grid grid-cols-1 gap-3 md:grid-cols-3">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm uppercase tracking-wide text-muted-foreground">{t("reports.sessionDuration")}</span>
                        <strong className="text-ink tnum">{formatDuration(session.durationSeconds)}</strong>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm uppercase tracking-wide text-muted-foreground">{t("reports.sessionRate")}</span>
                        <strong className="text-brand tnum">
                          {session.billingType === "hourly" && session.rate > 0
                            ? `${currencySymbol}${session.rate.toFixed(2)}/hr`
                            : "—"}
                        </strong>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm uppercase tracking-wide text-muted-foreground">{t("reports.sessionAmount")}</span>
                        <strong className="text-brand tnum">{session.amount > 0 ? `${currencySymbol}${session.amount.toFixed(2)}` : "—"}</strong>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ReportView />
    </Suspense>
  );
}
