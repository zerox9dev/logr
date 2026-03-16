import { useState } from "react";
import { Copy, Share2 } from "lucide-react";
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
  getCurrencySymbol,
  type ReportsRange,
} from "@/lib/report-share";
import s from "./reports-page.module.css";

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

  const shareLink = `${window.location.origin}/share/report?data=${encodeURIComponent(encodeSharedReport(report))}`;

  async function handleShare() {
    if (!selectedClient) {
      toast("Select a client first", "info");
      return;
    }
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Work report for ${selectedClient.name}`,
          text: `Hours and earnings report for ${selectedClient.name}`,
          url: shareLink,
        });
        return;
      }

      await navigator.clipboard.writeText(shareLink);
      toast("Share link copied");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      toast("Failed to share link", "error");
    }
  }

  async function handleCopy() {
    if (!selectedClient) {
      toast("Select a client first", "info");
      return;
    }
    try {
      await navigator.clipboard.writeText(shareLink);
      toast("Share link copied");
    } catch {
      toast("Failed to copy link", "error");
    }
  }

  return (
    <div className={sh.page}>
      <div className={sh.header}>
        <div>
          <h1 className={sh.title}>{t("reports.title")}</h1>
          <p className={s.shareHint}>Выбери клиента и сгенерируй публичную ссылку только для него.</p>
        </div>
        <div className={s.headerActions}>
          <select
            className={[sh.formSelect, s.clientSelect].join(" ")}
            value={selectedClientId}
            onChange={(event) => setSelectedClientId(event.target.value)}
          >
            <option value="">Select client</option>
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
            <Button variant="outline" size="sm" onClick={handleCopy} disabled={!selectedClient}>
              <Copy style={{ width: 14, height: 14 }} />
              Copy link
            </Button>
            <Button size="sm" onClick={handleShare} disabled={!selectedClient}>
              <Share2 style={{ width: 14, height: 14 }} />
              Share
            </Button>
          </div>
        </div>
      </div>
      <div className={s.statsGrid}>
        <Card><CardContent className={s.statContent}><p className={s.statLabel}>{t("reports.totalTime")}</p><p className={s.statValue}>{formatDuration(report.totalSeconds)}</p></CardContent></Card>
        <Card><CardContent className={s.statContent}><p className={s.statLabel}>{t("reports.billable")}</p><p className={s.statValue}>{formatDuration(report.billableSeconds)}</p></CardContent></Card>
        <Card><CardContent className={s.statContent}><p className={s.statLabel}>{t("reports.earnings")}</p><p className={s.statValue}>{currencySymbol}{report.billableAmount.toFixed(0)}</p></CardContent></Card>
        <Card><CardContent className={s.statContent}><p className={s.statLabel}>Paid</p><p className={[s.statValue, s.statValueGreen].join(" ")}>{currencySymbol}{report.paidAmount.toFixed(0)}</p></CardContent></Card>
      </div>
      <div className={s.grid2}>
        <Card><CardHeader><CardTitle style={{ fontSize: "1.125rem" }}>{t("reports.byProject")}</CardTitle></CardHeader><CardContent>
          {report.topProjects.length === 0 ? <p className={sh.emptyText}>{t("common.noData")}</p> : (
            <div className={s.barList}>{report.topProjects.map((item, i) => (
              <div key={`${item.name}-${i}`} className={s.barItem}><div className={s.barHeader}><span className={s.barName}>{item.name}</span><span className={s.barDuration}>{formatDuration(item.durationSeconds)}</span></div>
                <div className={s.barTrack}><div className={[s.barFill, s.barFillGreen].join(" ")} style={{ width: `${(item.durationSeconds / (report.topProjects[0]?.durationSeconds || 1)) * 100}%` }} /></div></div>
            ))}</div>
          )}
        </CardContent></Card>
        <Card><CardHeader><CardTitle style={{ fontSize: "1.125rem" }}>{t("reports.byClient")}</CardTitle></CardHeader><CardContent>
          {report.topClients.length === 0 ? <p className={sh.emptyText}>{t("common.noData")}</p> : (
            <div className={s.barList}>{report.topClients.map((item, i) => (
              <div key={`${item.name}-${i}`} className={s.barItem}><div className={s.barHeader}><span className={s.barName}>{item.name}</span><span className={s.barDuration}>{formatDuration(item.durationSeconds)}</span></div>
                <div className={s.barTrack}><div className={[s.barFill, s.barFillBlue].join(" ")} style={{ width: `${(item.durationSeconds / (report.topClients[0]?.durationSeconds || 1)) * 100}%` }} /></div></div>
            ))}</div>
          )}
        </CardContent></Card>
      </div>
    </div>
  );
}
