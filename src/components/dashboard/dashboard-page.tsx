import { useState, useMemo } from "react";
import { Clock, FolderKanban, Users, FileText, TrendingUp, TrendingDown, ArrowRight, AlertTriangle, Play, Timer, DollarSign, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppData } from "@/lib/data-context";
import { t } from "@/lib/i18n";
import s from "./dashboard-page.module.css";

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m`;
  return "0m";
}

const WEEKS = 52;
const DAYS_OF_WEEK = ["Mon", "", "Wed", "", "Fri", "", ""];
const INTENSITY_CLASSES = [s.intensity0, s.intensity1, s.intensity2, s.intensity3, s.intensity4, s.intensity5];

function getIntensity(hours: number): number {
  if (hours === 0) return 0;
  if (hours < 1) return 1;
  if (hours < 2) return 2;
  if (hours < 4) return 3;
  if (hours < 6) return 4;
  return 5;
}

// ── Activity Graph (GitHub-style) ──

function ActivityGraph({ sessions }: { sessions: { started_at: string; duration_seconds: number }[] }) {
  const [hoveredDay, setHoveredDay] = useState<{ date: string; hours: number; x: number; y: number } | null>(null);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const dayMap = new Map<string, number>();
  sessions.forEach((se) => { const key = se.started_at.slice(0, 10); dayMap.set(key, (dayMap.get(key) || 0) + se.duration_seconds / 3600); });
  const todayDay = today.getDay();
  const mondayOffset = todayDay === 0 ? 6 : todayDay - 1;
  const endOfWeek = new Date(today);
  endOfWeek.setDate(endOfWeek.getDate() + (6 - mondayOffset));
  const grid: { date: Date; hours: number }[][] = [];
  for (let w = WEEKS - 1; w >= 0; w--) {
    const week: { date: Date; hours: number }[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(endOfWeek);
      date.setDate(date.getDate() - w * 7 - (6 - d));
      const key = date.toISOString().slice(0, 10);
      week.push({ date, hours: dayMap.get(key) || 0 });
    }
    grid.push(week);
  }
  const months: { label: string; col: number }[] = [];
  let lastMonth = -1;
  grid.forEach((week, i) => { const m = week[0].date.getMonth(); if (m !== lastMonth) { months.push({ label: week[0].date.toLocaleDateString([], { month: "short" }), col: i }); lastMonth = m; } });
  const allDays = grid.flat().filter((d) => d.date <= today);
  const totalDays = allDays.filter((d) => d.hours > 0).length;
  const totalHours = allDays.reduce((sum, d) => sum + d.hours, 0);
  let streak = 0;
  for (const d of [...allDays].reverse()) { if (d.hours > 0) streak++; else break; }
  const avgPerDay = totalDays > 0 ? (totalHours / totalDays) : 0;

  return (
    <Card>
      <CardContent className={s.activityContent}>
        <div className={s.activityStatsRow}>
          <div className={s.activityStatBlock}>
            <span className={s.activityStatNum}>{totalHours.toFixed(0)}h</span>
            <span className={s.activityStatLabel}>{t("dash.total")}</span>
          </div>
          <div className={s.activityStatBlock}>
            <span className={s.activityStatNum}>{totalDays}</span>
            <span className={s.activityStatLabel}>{t("dash.activeDays")}</span>
          </div>
          <div className={s.activityStatBlock}>
            <span className={s.activityStatNum}>{avgPerDay.toFixed(1)}h</span>
            <span className={s.activityStatLabel}>avg/day</span>
          </div>
          {streak > 0 && (
            <div className={s.activityStatBlock}>
              <span className={s.activityStatNum}>🔥 {streak}</span>
              <span className={s.activityStatLabel}>{t("dash.dayStreak")}</span>
            </div>
          )}
        </div>
        <div className={s.graphWrap}>
          <div className={s.graphDays}>
            {DAYS_OF_WEEK.map((d, i) => <div key={i} className={s.graphDayLabel}>{d}</div>)}
          </div>
          <div className={s.graphMain}>
            <div className={s.graphMonths}>
              {months.map((m, i) => <div key={i} className={s.graphMonthLabel} style={{ left: `${m.col * 16}px`, marginLeft: i === 0 ? 0 : `-${months[i - 1]?.label.length * 5}px` }}>{m.label}</div>)}
            </div>
            <div className={s.graphWeeks}>
              {grid.map((week, wi) => (
                <div key={wi} className={s.graphWeek}>
                  {week.map((day, di) => {
                    const isFuture = day.date > today;
                    return <div key={di} className={[s.graphCell, isFuture ? s.graphCellFuture : INTENSITY_CLASSES[getIntensity(day.hours)]].join(" ")}
                      onMouseEnter={(e) => { if (!isFuture) { const rect = (e.target as HTMLElement).getBoundingClientRect(); setHoveredDay({ date: day.date.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" }), hours: day.hours, x: rect.left + rect.width / 2, y: rect.top }); } }}
                      onMouseLeave={() => setHoveredDay(null)} />;
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className={s.graphLegend}>
          <span>Less</span>{INTENSITY_CLASSES.map((cls, i) => <div key={i} className={[s.graphLegendCell, cls].join(" ")} />)}<span>More</span>
        </div>
        {hoveredDay && <div className={s.graphTooltip} style={{ left: hoveredDay.x, top: hoveredDay.y - 32 }}>{hoveredDay.hours > 0 ? `${hoveredDay.hours.toFixed(1)}h` : "No activity"} · {hoveredDay.date}</div>}
      </CardContent>
    </Card>
  );
}

// ── Stat Card ──

function StatCard({ icon: Icon, label, value, trend, trendUp, colorClass }: { icon: any; label: string; value: string; trend?: string; trendUp?: boolean; colorClass: string }) {
  return (
    <Card className={s.statCard}>
      <CardContent className={s.statContent}>
        <div className={[s.statIconWrap, colorClass].join(" ")}>
          <Icon className={s.statIcon} />
        </div>
        <div className={s.statBody}>
          <p className={s.statValue}>{value}</p>
          <p className={s.statLabel}>{label}</p>
        </div>
        {trend && (
          <div className={[s.trendBadge, trendUp ? s.trendUp : s.trendDown].join(" ")}>
            {trendUp ? <TrendingUp className={s.trendIcon} /> : <TrendingDown className={s.trendIcon} />}
            {trend}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Weekly Bar Chart ──

function WeeklyChart({ sessions }: { sessions: { started_at: string; duration_seconds: number }[] }) {
  const data = useMemo(() => {
    const now = new Date();
    const days: { label: string; hours: number; isToday: boolean }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const hours = sessions
        .filter((se) => se.started_at.slice(0, 10) === key)
        .reduce((sum, se) => sum + se.duration_seconds / 3600, 0);
      days.push({
        label: d.toLocaleDateString([], { weekday: "short" }),
        hours,
        isToday: i === 0,
      });
    }
    return days;
  }, [sessions]);

  const maxHours = Math.max(...data.map((d) => d.hours), 1);

  return (
    <Card>
      <CardHeader className={s.cardHeader}>
        <CardTitle className={s.cardTitle}>{t("dash.thisWeek")}</CardTitle>
        <span className={s.weekTotal}>{data.reduce((s, d) => s + d.hours, 0).toFixed(1)}h</span>
      </CardHeader>
      <CardContent>
        <div className={s.barChart}>
          {data.map((day, i) => (
            <div key={i} className={s.barCol}>
              <div className={s.barTrack}>
                <div
                  className={[s.bar, day.isToday ? s.barToday : s.barDefault].join(" ")}
                  style={{ height: `${(day.hours / maxHours) * 100}%` }}
                />
              </div>
              <span className={[s.barLabel, day.isToday ? s.barLabelToday : ""].join(" ")}>{day.label}</span>
              {day.hours > 0 && <span className={s.barValue}>{day.hours.toFixed(1)}h</span>}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Top Projects ──

function TopProjects({ sessions, projects }: { sessions: any[]; projects: any[] }) {
  const data = useMemo(() => {
    const map = new Map<string, number>();
    sessions.forEach((se) => {
      if (se.project_id) map.set(se.project_id, (map.get(se.project_id) || 0) + se.duration_seconds);
    });
    return [...map.entries()]
      .map(([id, secs]) => ({ project: projects.find((p) => p.id === id), seconds: secs }))
      .filter((d) => d.project)
      .sort((a, b) => b.seconds - a.seconds)
      .slice(0, 5);
  }, [sessions, projects]);

  const maxSecs = data[0]?.seconds || 1;

  return (
    <Card>
      <CardHeader className={s.cardHeader}>
        <CardTitle className={s.cardTitle}>{t("sidebar.projects")}</CardTitle>
        <Link to="/app/projects"><Button variant="ghost" size="sm">{t("common.viewAll")}</Button></Link>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className={s.emptyText}>{t("dash.noEntries")}</p>
        ) : (
          <div className={s.topProjectsList}>
            {data.map((d) => (
              <div key={d.project.id} className={s.topProjectRow}>
                <div className={s.topProjectInfo}>
                  <span className={s.topProjectName}>{d.project.name}</span>
                  <span className={s.topProjectTime}>{formatDuration(d.seconds)}</span>
                </div>
                <div className={s.topProjectBarTrack}>
                  <div className={s.topProjectBar} style={{ width: `${(d.seconds / maxSecs) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Main Dashboard ──

export function DashboardPage() {
  const { sessions, projects, clients, invoices, settings, timerRunning, timerSeconds, timerDescription, getProjectById } = useAppData();
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const name = settings?.full_name?.split(" ")[0];
  const greeting = name ? `${t("dash.greeting")}, ${name}` : `${t("dash.greeting")}`;
  const todayTotal = sessions.filter((se) => se.started_at.slice(0, 10) === todayStr).reduce((sum, se) => sum + se.duration_seconds, 0);
  const weekStart = new Date(now);
  const day = weekStart.getDay();
  weekStart.setDate(weekStart.getDate() - day + (day === 0 ? -6 : 1));
  weekStart.setHours(0, 0, 0, 0);
  const weekSessions = sessions.filter((se) => se.started_at >= weekStart.toISOString());
  const weekTotal = weekSessions.reduce((sum, se) => sum + se.duration_seconds, 0);
  const unpaidTotal = invoices.filter((i) => i.status !== "paid").reduce((sum, i) => sum + Number(i.total), 0);
  const overdueInvoices = invoices.filter((i) => i.status === "overdue" || (i.status === "sent" && i.due_date && i.due_date < todayStr));
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const thisMonthPaid = invoices.filter((i) => i.status === "paid" && i.paid_at && i.paid_at >= monthStart).reduce((sum, i) => sum + Number(i.total), 0);
  const isEmpty = sessions.length === 0 && projects.length === 0 && clients.length === 0;

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);
  const yesterdayTotal = sessions.filter((se) => se.started_at.slice(0, 10) === yesterdayStr).reduce((sum, se) => sum + se.duration_seconds, 0);
  const todayTrend = yesterdayTotal > 0 ? Math.round(((todayTotal - yesterdayTotal) / yesterdayTotal) * 100) : null;

  // Effective hourly rate
  const totalSeconds = sessions.reduce((sum, se) => sum + se.duration_seconds, 0);
  const totalEarned = invoices.filter((i) => i.status === "paid").reduce((sum, i) => sum + Number(i.total), 0);
  const effectiveRate = totalSeconds > 0 ? (totalEarned / (totalSeconds / 3600)) : 0;

  return (
    <div className={s.page}>
      <div>
        <h1 className={s.greeting}>{greeting} 👋</h1>
        <p className={s.dateLine}>{now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}</p>
      </div>

      {timerRunning && (
        <Link to="/app/timer">
          <Card className={s.timerBanner}>
            <CardContent className={s.timerBannerContent}>
              <div className={s.timerBannerLeft}>
                <div className={s.timerDot} />
                <span className={s.timerBannerName}>{timerDescription || t("timer.untitled")}</span>
                <span className={s.timerBannerTime}>{formatDuration(timerSeconds)}</span>
              </div>
              <ArrowRight className={s.timerBannerArrow} />
            </CardContent>
          </Card>
        </Link>
      )}

      {overdueInvoices.length > 0 && (
        <Link to="/app/invoices">
          <Card className={s.overdueBanner}>
            <CardContent className={s.overdueBannerContent}>
              <div className={s.overdueBannerLeft}>
                <AlertTriangle className={s.overdueIcon} />
                <span className={s.overdueText}>
                  {overdueInvoices.length} {overdueInvoices.length > 1 ? t("dash.overdueInvoices") : t("dash.overdueInvoice")} — ${overdueInvoices.reduce((su, i) => su + Number(i.total), 0).toFixed(0)}
                </span>
              </div>
              <ArrowRight className={s.overdueArrow} />
            </CardContent>
          </Card>
        </Link>
      )}

      {isEmpty ? (
        <Card>
          <CardContent className={s.emptyContent}>
            <Timer className={s.emptyIcon} />
            <div>
              <h2 className={s.emptyTitle}>{t("dash.getStarted")}</h2>
              <p className={s.emptyDesc}>{t("dash.getStartedDesc")}</p>
            </div>
            <div className={s.emptyActions}>
              <Link to="/app/timer"><Button><Play style={{ width: 16, height: 16 }} /> {t("dash.startTimer")}</Button></Link>
              <Link to="/app/projects"><Button variant="outline"><FolderKanban style={{ width: 16, height: 16 }} /> {t("dash.createProject")}</Button></Link>
              <Link to="/app/clients"><Button variant="outline"><Users style={{ width: 16, height: 16 }} /> {t("dash.addClient")}</Button></Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className={s.statsGrid}>
            <StatCard icon={Clock} label={t("dash.today")} value={formatDuration(todayTotal)}
              trend={todayTrend !== null ? `${todayTrend > 0 ? "+" : ""}${todayTrend}%` : undefined}
              trendUp={todayTrend !== null ? todayTrend >= 0 : undefined} colorClass={s.iconEmerald} />
            <StatCard icon={TrendingUp} label={t("dash.thisWeek")} value={formatDuration(weekTotal)} colorClass={s.iconBlue} />
            <StatCard icon={FileText} label={t("dash.unpaid")} value={`$${unpaidTotal.toFixed(0)}`} colorClass={s.iconAmber} />
            <StatCard icon={DollarSign} label={t("dash.thisMonth")} value={`$${thisMonthPaid.toFixed(0)}`} colorClass={s.iconViolet} />
          </div>

          <ActivityGraph sessions={sessions} />

          <div className={s.bottomGrid}>
            <WeeklyChart sessions={sessions} />
            <TopProjects sessions={sessions} projects={projects} />
          </div>

          {effectiveRate > 0 && (
            <Card className={s.rateCard}>
              <CardContent className={s.rateContent}>
                <Target className={s.rateIcon} />
                <div>
                  <span className={s.rateValue}>${effectiveRate.toFixed(0)}/hr</span>
                  <span className={s.rateLabel}>effective rate</span>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
