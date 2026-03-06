import { useState } from "react";
import { Clock, FolderKanban, Users, FileText, TrendingUp, ArrowRight, AlertTriangle, Play, Timer } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppData } from "@/lib/data-context";

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m`;
  return "0m";
}

// ── Activity Graph ──

const WEEKS = 17;
const DAYS_OF_WEEK = ["Mon", "", "Wed", "", "Fri", "", ""];
const INTENSITY = [
  "bg-[#ebe7e0]", "bg-emerald-200", "bg-emerald-300", "bg-emerald-400", "bg-emerald-500", "bg-emerald-600",
];

function getIntensity(hours: number): number {
  if (hours === 0) return 0;
  if (hours < 1) return 1;
  if (hours < 2) return 2;
  if (hours < 4) return 3;
  if (hours < 6) return 4;
  return 5;
}

function ActivityGraph({ sessions }: { sessions: { started_at: string; duration_seconds: number }[] }) {
  const [hoveredDay, setHoveredDay] = useState<{ date: string; hours: number; x: number; y: number } | null>(null);
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  const dayMap = new Map<string, number>();
  sessions.forEach((s) => {
    const key = s.started_at.slice(0, 10);
    dayMap.set(key, (dayMap.get(key) || 0) + s.duration_seconds / 3600);
  });

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
  grid.forEach((week, i) => {
    const m = week[0].date.getMonth();
    if (m !== lastMonth) {
      months.push({ label: week[0].date.toLocaleDateString([], { month: "short" }), col: i });
      lastMonth = m;
    }
  });

  const allDays = grid.flat().filter((d) => d.date <= today);
  const totalDays = allDays.filter((d) => d.hours > 0).length;
  const totalHours = allDays.reduce((s, d) => s + d.hours, 0);
  let streak = 0;
  for (const d of [...allDays].reverse()) {
    if (d.hours > 0) streak++; else break;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">Activity</CardTitle>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span><strong className="text-foreground">{totalDays}</strong> active days</span>
          <span><strong className="text-foreground">{totalHours.toFixed(0)}h</strong> total</span>
          {streak > 0 && <span>🔥 <strong className="text-foreground">{streak}</strong> day streak</span>}
        </div>
      </CardHeader>
      <CardContent className="relative">
        <div className="flex gap-1">
          <div className="flex flex-col gap-[3px] pr-2 pt-5">
            {DAYS_OF_WEEK.map((d, i) => (
              <div key={i} className="h-[13px] text-[10px] leading-[13px] text-muted-foreground">{d}</div>
            ))}
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="flex gap-[3px] mb-1 h-4">
              {months.map((m, i) => (
                <div key={i} className="text-[10px] text-muted-foreground" style={{
                  position: "relative", left: `${m.col * 16}px`,
                  marginLeft: i === 0 ? 0 : `-${months[i - 1]?.label.length * 5}px`,
                }}>{m.label}</div>
              ))}
            </div>
            <div className="flex gap-[3px]">
              {grid.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-[3px]">
                  {week.map((day, di) => {
                    const isFuture = day.date > today;
                    return (
                      <div key={di}
                        className={`h-[13px] w-[13px] rounded-sm ${isFuture ? "bg-transparent" : INTENSITY[getIntensity(day.hours)]} transition-colors`}
                        onMouseEnter={(e) => {
                          if (!isFuture) {
                            const rect = (e.target as HTMLElement).getBoundingClientRect();
                            setHoveredDay({ date: day.date.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" }), hours: day.hours, x: rect.left + rect.width / 2, y: rect.top });
                          }
                        }}
                        onMouseLeave={() => setHoveredDay(null)}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-1 mt-3 text-[10px] text-muted-foreground">
          <span>Less</span>
          {INTENSITY.map((cls, i) => <div key={i} className={`h-[11px] w-[11px] rounded-sm ${cls}`} />)}
          <span>More</span>
        </div>
        {hoveredDay && (
          <div className="fixed z-50 px-2 py-1 rounded-md bg-foreground text-background text-xs font-medium pointer-events-none"
            style={{ left: hoveredDay.x, top: hoveredDay.y - 32, transform: "translateX(-50%)" }}>
            {hoveredDay.hours > 0 ? `${hoveredDay.hours.toFixed(1)}h` : "No activity"} · {hoveredDay.date}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Dashboard ──

export function DashboardPage() {
  const { sessions, projects, clients, invoices, settings, timerRunning, timerSeconds, timerDescription, getProjectById } = useAppData();

  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const name = settings?.full_name?.split(" ")[0];
  const greeting = name ? `Hey, ${name}` : "Welcome back";

  const todayTotal = sessions.filter((s) => s.started_at.slice(0, 10) === todayStr).reduce((sum, s) => sum + s.duration_seconds, 0);

  const weekStart = new Date(now);
  const day = weekStart.getDay();
  weekStart.setDate(weekStart.getDate() - day + (day === 0 ? -6 : 1));
  weekStart.setHours(0, 0, 0, 0);
  const weekStartStr = weekStart.toISOString();
  const weekSessions = sessions.filter((s) => s.started_at >= weekStartStr);
  const weekTotal = weekSessions.reduce((sum, s) => sum + s.duration_seconds, 0);

  const unpaidTotal = invoices.filter((i) => i.status !== "paid").reduce((sum, i) => sum + Number(i.total), 0);
  const overdueInvoices = invoices.filter((i) => i.status === "overdue" || (i.status === "sent" && i.due_date && i.due_date < todayStr));

  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const thisMonthPaid = invoices.filter((i) => i.status === "paid" && i.paid_at && i.paid_at >= monthStart).reduce((sum, i) => sum + Number(i.total), 0);

  const recentSessions = sessions.slice(0, 5);
  const isEmpty = sessions.length === 0 && projects.length === 0 && clients.length === 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{greeting} 👋</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </div>

      {isTimerRunning(timerRunning) && (
        <Link to="/app/timer">
          <Card className="border-emerald-200 bg-emerald-50">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-medium">{timerDescription || "Timer running"}</span>
                <span className="text-xs text-muted-foreground">{formatDuration(timerSeconds)}</span>
              </div>
              <ArrowRight className="h-4 w-4 text-emerald-600" />
            </CardContent>
          </Card>
        </Link>
      )}

      {overdueInvoices.length > 0 && (
        <Link to="/app/invoices">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium text-red-700">
                  {overdueInvoices.length} overdue invoice{overdueInvoices.length > 1 ? "s" : ""} — ${overdueInvoices.reduce((s, i) => s + Number(i.total), 0).toFixed(0)}
                </span>
              </div>
              <ArrowRight className="h-4 w-4 text-red-400" />
            </CardContent>
          </Card>
        </Link>
      )}

      {isEmpty ? (
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <Timer className="h-12 w-12 text-muted-foreground/30 mx-auto" />
            <div>
              <h2 className="text-lg font-semibold">Get started with Logr</h2>
              <p className="text-sm text-muted-foreground mt-1">Track time, manage projects, and invoice clients.</p>
            </div>
            <div className="flex justify-center gap-3">
              <Link to="/app/timer"><Button><Play className="h-4 w-4" /> Start Timer</Button></Link>
              <Link to="/app/projects"><Button variant="outline"><FolderKanban className="h-4 w-4" /> Create Project</Button></Link>
              <Link to="/app/clients"><Button variant="outline"><Users className="h-4 w-4" /> Add Client</Button></Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-l-[3px] border-l-emerald-400">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 text-muted-foreground mb-2"><Clock className="h-4 w-4" /><span className="text-xs font-medium">Today</span></div>
                <p className="text-2xl font-bold">{formatDuration(todayTotal)}</p>
              </CardContent>
            </Card>
            <Card className="border-l-[3px] border-l-blue-400">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 text-muted-foreground mb-2"><TrendingUp className="h-4 w-4" /><span className="text-xs font-medium">This Week</span></div>
                <p className="text-2xl font-bold">{formatDuration(weekTotal)}</p>
              </CardContent>
            </Card>
            <Card className="border-l-[3px] border-l-amber-400">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 text-muted-foreground mb-2"><FileText className="h-4 w-4" /><span className="text-xs font-medium">Unpaid</span></div>
                <p className="text-2xl font-bold">${unpaidTotal.toFixed(0)}</p>
              </CardContent>
            </Card>
            <Card className="border-l-[3px] border-l-violet-400">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 text-muted-foreground mb-2"><FileText className="h-4 w-4" /><span className="text-xs font-medium">This Month</span></div>
                <p className="text-2xl font-bold text-emerald-600">${thisMonthPaid.toFixed(0)}</p>
              </CardContent>
            </Card>
          </div>

          <ActivityGraph sessions={sessions} />

          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Recent Activity</CardTitle>
                <Link to="/app/timer"><Button variant="ghost" size="sm">View all</Button></Link>
              </CardHeader>
              <CardContent>
                {recentSessions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">No entries yet.</p>
                ) : (
                  <div className="space-y-3">
                    {recentSessions.map((session) => {
                      const project = getProjectById(session.project_id);
                      return (
                        <div key={session.id} className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">{session.name}</p>
                            <p className="text-xs text-muted-foreground">{project?.name || "No project"}</p>
                          </div>
                          <span className="text-sm font-mono">{formatDuration(session.duration_seconds)}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link to="/app/timer" className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent transition-colors">
                  <Play className="h-4 w-4 text-emerald-600" /><span className="text-sm font-medium">Start Timer</span>
                </Link>
                <Link to="/app/projects" className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent transition-colors">
                  <FolderKanban className="h-4 w-4 text-muted-foreground" /><span className="text-sm font-medium">{projects.length} Projects</span>
                </Link>
                <Link to="/app/clients" className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent transition-colors">
                  <Users className="h-4 w-4 text-muted-foreground" /><span className="text-sm font-medium">{clients.length} Clients</span>
                </Link>
                <Link to="/app/invoices" className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent transition-colors">
                  <FileText className="h-4 w-4 text-muted-foreground" /><span className="text-sm font-medium">{invoices.length} Invoices</span>
                </Link>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function isTimerRunning(v: boolean) { return v; }
