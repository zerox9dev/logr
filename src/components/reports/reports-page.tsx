import { useState } from "react";
import { Copy, Info, Share2, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppData } from "@/lib/data-context";
import { t } from "@/lib/i18n";
import { useToast } from "@/components/ui/toast";
import sh from "@/components/shared.module.css";
import {
  createReportSummary,
  encodeSharedReport,
  formatDuration,
  generateCSV,
  getCurrencySymbol,
  type ReportsRange,
} from "@/lib/report-share";
import s from "./reports-page.module.css";

function MetricLabel({ label, hint }: { label: string; hint: string }) {
  return (
    <span className={s.metricLabelWrap}>
      {label}
      <span className={s.metricHint}>
        <Info style={{ width: 13, height: 13 }} />
        <span className={s.metricTooltip}>{hint}</span>
      </span>
    </span>
  );
}

export function ReportsPage() {
  const { sessions, clients, settings, getProjectById } = useAppData();
  const { toast } = useToast();
  const [range, setRange] = useState<ReportsRange>("week");
  const [selectedClientId, setSelectedClientId] = useState("");
  const selectedClient = clients.find((client) => client.id === selectedClientId) || null;
  const report = createReportSummary({
    sessions,
    clients,
    range,
    defaultCurrency: settings?.default_currency,
    defaultRate: settings?.default_rate,
    clientId: selectedClientId || null,
    clientName: selectedClient?.name || null,
    getProjectById,
    noProjectLabel: t("timer.noProject"),
    noClientLabel: "—",
  });
  const currencySymbol = getCurrencySymbol(report.currency);
  const activeDays = new Set(report.sessions.map((session) => session.startedAt.slice(0, 10))).size;
  const utilization = report.totalSeconds > 0 ? (report.billableSeconds / report.totalSeconds) * 100 : 0;
  const effectiveRate = report.billableSeconds > 0 ? report.billableAmount / (report.billableSeconds / 3600) : 0;
  const revenuePerDay = activeDays > 0 ? report.billableAmount / activeDays : 0;
  const topProjectShare = report.totalSeconds > 0 && report.topProjects[0]
    ? (report.topProjects[0].durationSeconds / report.totalSeconds) * 100
    : 0;
  const projectInsights = report.topProjects.map((project) => {
    const amount = report.sessions
      .filter((session) => session.projectName === project.name)
      .reduce((sum, session) => sum + session.amount, 0);
    const share = report.totalSeconds > 0 ? (project.durationSeconds / report.totalSeconds) * 100 : 0;
    return { ...project, amount, share };
  });

  const shareLink = `${window.location.origin}/share/report?data=${encodeURIComponent(encodeSharedReport(report))}`;

  async function handleShare() {
    if (!selectedClient) {
      toast(t("reports.selectClientFirst"), "info");
      return;
    }
    try {
      if (navigator.share) {
        await navigator.share({
          title: t("reports.workReportForClient").replace("{client}", selectedClient.name),
          text: t("reports.hoursAndEarningsForClient").replace("{client}", selectedClient.name),
          url: shareLink,
        });
        return;
      }

      await navigator.clipboard.writeText(shareLink);
      toast(t("reports.shareLinkCopied"));
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      toast(t("reports.shareLinkFailed"), "error");
    }
  }

  async function handleCopy() {
    if (!selectedClient) {
      toast(t("reports.selectClientFirst"), "info");
      return;
    }
    try {
      await navigator.clipboard.writeText(shareLink);
      toast(t("reports.shareLinkCopied"));
    } catch {
      toast(t("reports.copyLinkFailed"), "error");
    }
  }

  function handleExportCSV() {
    const csv = generateCSV(report);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `logr-report-${range}-${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast(t("reports.csvExported"));
  }

  return (
    <div className={sh.page}>
      <div className={sh.header}>
        <div>
          <h1 className={sh.title}>{t("reports.title")}</h1>
          <p className={s.shareHint}>{t("reports.shareHintClient")}</p>
        </div>
        <div className={s.headerActions}>
          <select
            className={[sh.formSelect, s.clientSelect].join(" ")}
            value={selectedClientId}
            onChange={(event) => setSelectedClientId(event.target.value)}
          >
            <option value="">{t("reports.selectClient")}</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>{client.name}</option>
            ))}
          </select>
          <div className={sh.filterBar}>
            {(["week", "month", "all"] as const).map((r) => (
              <Button key={r} variant={range === r ? "default" : "ghost"} size="sm" onClick={() => setRange(r)} style={{ textTransform: "capitalize" }}>{r === "all" ? t("common.all") : t(`reports.${r}`)}</Button>
            ))}
          </div>
          <div className={s.shareActions}>
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download style={{ width: 14, height: 14 }} />
              CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handleCopy} disabled={!selectedClient}>
              <Copy style={{ width: 14, height: 14 }} />
              {t("reports.copyLink")}
            </Button>
            <Button size="sm" onClick={handleShare} disabled={!selectedClient}>
              <Share2 style={{ width: 14, height: 14 }} />
              {t("reports.share")}
            </Button>
          </div>
        </div>
      </div>
      <section className={s.widgetsSection}>
        <div className={s.statsGrid}>
          <Card><CardContent className={s.statContent}><p className={s.statLabel}>{t("reports.totalTime")}</p><p className={s.statValue}>{formatDuration(report.totalSeconds)}</p></CardContent></Card>
          <Card><CardContent className={s.statContent}><p className={s.statLabel}>{t("reports.billable")}</p><p className={s.statValue}>{formatDuration(report.billableSeconds)}</p></CardContent></Card>
          <Card><CardContent className={s.statContent}><p className={s.statLabel}>{t("reports.earnings")}</p><p className={s.statValue}>{currencySymbol}{report.billableAmount.toFixed(0)}</p></CardContent></Card>
          <Card><CardContent className={s.statContent}><p className={s.statLabel}>Paid</p><p className={[s.statValue, s.statValueGreen].join(" ")}>{currencySymbol}{report.paidAmount.toFixed(0)}</p></CardContent></Card>
        </div>
        {report.sessions.length > 0 && (
          <div className={s.insightGrid}>
            <div className={s.insightCard}>
              <span className={s.insightLabel}><MetricLabel label={t("reports.billableUtilization")} hint={t("reports.billableUtilizationHint")} /></span>
              <strong className={s.insightValue}>{utilization.toFixed(0)}%</strong>
              <span className={s.insightMeta}>{t("reports.billableUtilizationMeta")}</span>
            </div>
            <div className={s.insightCard}>
              <span className={s.insightLabel}><MetricLabel label={t("reports.effectiveRate")} hint={t("reports.effectiveRateHint")} /></span>
              <strong className={s.insightValue}>{currencySymbol}{effectiveRate.toFixed(0)}/hr</strong>
              <span className={s.insightMeta}>{t("reports.effectiveRateMeta")}</span>
            </div>
            <div className={s.insightCard}>
              <span className={s.insightLabel}><MetricLabel label={t("reports.revenuePerActiveDay")} hint={t("reports.revenuePerActiveDayHint")} /></span>
              <strong className={s.insightValue}>{currencySymbol}{revenuePerDay.toFixed(0)}</strong>
              <span className={s.insightMeta}>{activeDays} {t("reports.revenuePerActiveDayMeta")}</span>
            </div>
            <div className={s.insightCard}>
              <span className={s.insightLabel}><MetricLabel label={t("reports.topProjectConcentration")} hint={t("reports.topProjectConcentrationHint")} /></span>
              <strong className={[s.insightValue, s.insightValueWarn].join(" ")}>{topProjectShare.toFixed(0)}%</strong>
              <span className={s.insightMeta}>{t("reports.topProjectConcentrationMeta")}</span>
            </div>
          </div>
        )}
      </section>
      <section className={s.breakdownSection}>
        <Card><CardHeader><CardTitle style={{ fontSize: "1.125rem" }}>{t("reports.byProject")}</CardTitle></CardHeader><CardContent>
          {projectInsights.length === 0 ? <p className={sh.emptyText}>{t("common.noData")}</p> : (
            <div className={s.projectStack}>
              {projectInsights.map((project, i) => (
                <article key={`${project.name}-${i}`} className={s.projectCard}>
                  <div className={s.projectCardTop}>
                    <div>
                      <div className={s.projectCardName}>{project.name}</div>
                      <div className={s.projectCardMeta}>
                        {formatDuration(project.durationSeconds)} • {project.share.toFixed(0)}% {t("reports.ofTime")}
                        <span className={s.metricHintInline}>
                          <Info style={{ width: 12, height: 12 }} />
                          <span className={s.metricTooltip}>{t("reports.projectShareHint")}</span>
                        </span>
                      </div>
                    </div>
                    <div className={s.projectCardAmount}>{currencySymbol}{project.amount.toFixed(0)}</div>
                  </div>
                  <div className={s.projectTrack}>
                    <div
                      className={s.projectFill}
                      style={{ width: `${project.share}%` }}
                    />
                  </div>
                </article>
              ))}
            </div>
          )}
        </CardContent></Card>
      </section>
    </div>
  );
}
