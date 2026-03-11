import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppData } from "@/lib/data-context";
import { t } from "@/lib/i18n";
import sh from "@/components/shared.module.css";
import s from "./reports-page.module.css";

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600); const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`; return `${m}m`;
}

export function ReportsPage() {
  const { sessions, clients, settings, getProjectById } = useAppData();
  const [range, setRange] = useState<"week" | "month" | "all">("week");
  const now = new Date();
  let startDate: Date | null = null;
  if (range === "week") { startDate = new Date(now); const day = startDate.getDay(); startDate.setDate(startDate.getDate() - day + (day === 0 ? -6 : 1)); startDate.setHours(0, 0, 0, 0); }
  else if (range === "month") startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const startStr = startDate?.toISOString() || "";
  const filtered = startStr ? sessions.filter((se) => se.started_at >= startStr) : sessions;
  const totalSeconds = filtered.reduce((sum, e) => sum + e.duration_seconds, 0);
  const billableSeconds = filtered.filter((se) => se.billing_type === "hourly").reduce((sum, e) => sum + e.duration_seconds, 0);
  const getRate = (e: typeof filtered[0]) => {
    const sessionRate = Number(e.rate);
    if (sessionRate > 0) return sessionRate;
    if (e.project_id) {
      const p = getProjectById(e.project_id);
      if (p?.rate && p.rate > 0) return p.rate;
    }
    return Number(settings?.default_rate) || 0;
  };
  const calcEarnings = (onlyPaid: boolean) => filtered.reduce((sum, e) => {
    if (e.billing_type !== "hourly") return sum;
    if (onlyPaid && e.payment_status !== "paid") return sum;
    const rate = getRate(e);
    if (rate <= 0) return sum;
    return sum + (e.duration_seconds / 3600) * rate;
  }, 0);
  const billable = calcEarnings(false);
  const paid = calcEarnings(true);
  const projectMap = new Map<string, number>();
  filtered.forEach((se) => { const key = se.project_id || "__none__"; projectMap.set(key, (projectMap.get(key) || 0) + se.duration_seconds); });
  const topProjects = Array.from(projectMap.entries()).map(([id, dur]) => ({ project: id === "__none__" ? null : getProjectById(id), duration: dur })).sort((a, b) => b.duration - a.duration);
  const clientMap = new Map<string, number>();
  filtered.forEach((se) => { const key = se.client_id || "__none__"; clientMap.set(key, (clientMap.get(key) || 0) + se.duration_seconds); });
  const topClients = Array.from(clientMap.entries()).map(([id, dur]) => ({ client: id === "__none__" ? null : clients.find((c) => c.id === id), duration: dur })).sort((a, b) => b.duration - a.duration);

  return (
    <div className={sh.page}>
      <div className={sh.header}>
        <h1 className={sh.title}>{t("reports.title")}</h1>
        <div className={sh.filterBar}>
          {(["week", "month", "all"] as const).map((r) => (
            <Button key={r} variant={range === r ? "default" : "ghost"} size="sm" onClick={() => setRange(r)} style={{ textTransform: "capitalize" }}>{r === "all" ? t("common.all") : t(`reports.${r}`)}</Button>
          ))}
        </div>
      </div>
      <div className={s.statsGrid}>
        <Card><CardContent className={s.statContent}><p className={s.statLabel}>{t("reports.totalTime")}</p><p className={s.statValue}>{formatDuration(totalSeconds)}</p></CardContent></Card>
        <Card><CardContent className={s.statContent}><p className={s.statLabel}>{t("reports.billable")}</p><p className={s.statValue}>{formatDuration(billableSeconds)}</p></CardContent></Card>
        <Card><CardContent className={s.statContent}><p className={s.statLabel}>{t("reports.earnings")}</p><p className={s.statValue}>${billable.toFixed(0)}</p></CardContent></Card>
        <Card><CardContent className={s.statContent}><p className={s.statLabel}>Paid</p><p className={[s.statValue, s.statValueGreen].join(" ")}>${paid.toFixed(0)}</p></CardContent></Card>
      </div>
      <div className={s.grid2}>
        <Card><CardHeader><CardTitle style={{ fontSize: "1.125rem" }}>{t("reports.byProject")}</CardTitle></CardHeader><CardContent>
          {topProjects.length === 0 ? <p className={sh.emptyText}>{t("common.noData")}</p> : (
            <div className={s.barList}>{topProjects.map(({ project, duration }, i) => (
              <div key={i} className={s.barItem}><div className={s.barHeader}><span className={s.barName}>{project?.name || t("timer.noProject")}</span><span className={s.barDuration}>{formatDuration(duration)}</span></div>
                <div className={s.barTrack}><div className={[s.barFill, s.barFillGreen].join(" ")} style={{ width: `${(duration / (topProjects[0]?.duration || 1)) * 100}%` }} /></div></div>
            ))}</div>
          )}
        </CardContent></Card>
        <Card><CardHeader><CardTitle style={{ fontSize: "1.125rem" }}>{t("reports.byClient")}</CardTitle></CardHeader><CardContent>
          {topClients.length === 0 ? <p className={sh.emptyText}>{t("common.noData")}</p> : (
            <div className={s.barList}>{topClients.map(({ client, duration }, i) => (
              <div key={i} className={s.barItem}><div className={s.barHeader}><span className={s.barName}>{client?.name || "—"}</span><span className={s.barDuration}>{formatDuration(duration)}</span></div>
                <div className={s.barTrack}><div className={[s.barFill, s.barFillBlue].join(" ")} style={{ width: `${(duration / (topClients[0]?.duration || 1)) * 100}%` }} /></div></div>
            ))}</div>
          )}
        </CardContent></Card>
      </div>
    </div>
  );
}
