import { useState } from "react";
import { Clock, FolderKanban, Users, FileText, TrendingUp, ArrowRight, AlertTriangle, Play, Timer } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { TimeEntry, Project, Client, Invoice, Settings } from "@/types";

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m`;
  return "0m";
}

// ── Activity Graph (GitHub-style heatmap) ──

const WEEKS = 17; // ~4 months
const DAYS_OF_WEEK = ["Mon", "", "Wed", "", "Fri", "", ""];
const INTENSITY = [
  "bg-[#ebe7e0]",           // 0h
  "bg-emerald-200",         // <1h
  "bg-emerald-300",         // 1-2h
  "bg-emerald-400",         // 2-4h
  "bg-emerald-500",         // 4-6h
  "bg-emerald-600",         // 6h+
];

function getIntensity(hours: number): number {
  if (hours === 0) return 0;
  if (hours < 1) return 1;
  if (hours < 2) return 2;
  if (hours < 4) return 3;
  if (hours < 6) return 4;
  return 5;
}

function ActivityGraph({ entries }: { entries: TimeEntry[] }) {
  const [hoveredDay, setHoveredDay] = useState<{ date: string; hours: number; x: number; y: number } | null>(null);

  const today = new Date();
  today.setHours(23, 59, 59, 999);

  // Build map: dateStr → total hours
  const dayMap = new Map<string, number>();
  entries.forEach((e) => {
    const key = e.startedAt.toISOString().slice(0, 10);
    dayMap.set(key, (dayMap.get(key) || 0) + e.duration / 3600);
  });

  // Build grid: weeks × 7 days, ending today
  const todayDay = today.getDay(); // 0=Sun
  const mondayOffset = todayDay === 0 ? 6 : todayDay - 1;
  const endOfWeek = new Date(today);
  endOfWeek.setDate(endOfWeek.getDate() + (6 - mondayOffset)); // move to Sunday

  const grid: { date: Date; hours: number }[][] = [];
  for (let w = WEEKS - 1; w >= 0; w--) {
    const week: { date: Date; hours: number }[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(endOfWeek);
      date.setDate(date.getDate() - w * 7 - (6 - d));
      const key = date.toISOString().slice(0, 10);
      const hours = dayMap.get(key) || 0;
      week.push({ date, hours });
    }
    grid.push(week);
  }

  // Month labels
  const months: { label: string; col: number }[] = [];
  let lastMonth = -1;
  grid.forEach((week, i) => {
    const m = week[0].date.getMonth();
    if (m !== lastMonth) {
      months.push({
        label: week[0].date.toLocaleDateString([], { month: "short" }),
        col: i,
      });
      lastMonth = m;
    }
  });

  // Stats
  const totalDays = grid.flat().filter((d) => d.date <= today && d.hours > 0).length;
  const totalHours = grid.flat().filter((d) => d.date <= today).reduce((s, d) => s + d.hours, 0);

  // Current streak
  let streak = 0;
  const allDays = grid.flat().filter((d) => d.date <= today).reverse();
  for (const d of allDays) {
    if (d.hours > 0) streak++;
    else break;
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
          {/* Day labels */}
          <div className="flex flex-col gap-[3px] pr-2 pt-5">
            {DAYS_OF_WEEK.map((d, i) => (
              <div key={i} className="h-[13px] text-[10px] leading-[13px] text-muted-foreground">{d}</div>
            ))}
          </div>

          {/* Grid */}
          <div className="flex-1 overflow-hidden">
            {/* Month labels */}
            <div className="flex gap-[3px] mb-1 h-4">
              {months.map((m, i) => (
                <div key={i} className="text-[10px] text-muted-foreground" style={{
                  position: "relative",
                  left: `${m.col * 16}px`,
                  marginLeft: i === 0 ? 0 : `-${months[i - 1]?.label.length * 5}px`,
                }}>
                  {m.label}
                </div>
              ))}
            </div>

            <div className="flex gap-[3px]">
              {grid.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-[3px]">
                  {week.map((day, di) => {
                    const isFuture = day.date > today;
                    const intensity = isFuture ? 0 : getIntensity(day.hours);
                    return (
                      <div
                        key={di}
                        className={`h-[13px] w-[13px] rounded-sm ${isFuture ? "bg-transparent" : INTENSITY[intensity]} transition-colors`}
                        onMouseEnter={(e) => {
                          if (!isFuture) {
                            const rect = (e.target as HTMLElement).getBoundingClientRect();
                            setHoveredDay({
                              date: day.date.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" }),
                              hours: day.hours,
                              x: rect.left + rect.width / 2,
                              y: rect.top,
                            });
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

        {/* Legend */}
        <div className="flex items-center justify-end gap-1 mt-3 text-[10px] text-muted-foreground">
          <span>Less</span>
          {INTENSITY.map((cls, i) => (
            <div key={i} className={`h-[11px] w-[11px] rounded-sm ${cls}`} />
          ))}
          <span>More</span>
        </div>

        {/* Tooltip */}
        {hoveredDay && (
          <div
            className="fixed z-50 px-2 py-1 rounded-md bg-foreground text-background text-xs font-medium pointer-events-none"
            style={{ left: hoveredDay.x, top: hoveredDay.y - 32, transform: "translateX(-50%)" }}
          >
            {hoveredDay.hours > 0 ? `${hoveredDay.hours.toFixed(1)}h` : "No activity"} · {hoveredDay.date}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function getInvoiceTotal(invoice: Invoice): number {
  const subtotal = invoice.items.reduce((sum, item) => sum + item.hours * item.rate, 0);
  const afterDiscount = subtotal - (invoice.discount || 0);
  return afterDiscount + afterDiscount * ((invoice.taxRate || 0) / 100);
}

interface DashboardPageProps {
  entries: TimeEntry[];
  projects: Project[];
  clients: Client[];
  invoices: Invoice[];
  settings: Settings;
  isTimerRunning: boolean;
  timerSeconds: number;
  timerDescription: string;
  getProjectById: (id: string | null) => Project | undefined;
}

export function DashboardPage({ entries, projects, clients, invoices, settings, isTimerRunning, timerSeconds, timerDescription, getProjectById }: DashboardPageProps) {
  const now = new Date();
  const todayStr = now.toDateString();

  const greeting = settings.name ? `Hey, ${settings.name.split(" ")[0]}` : "Welcome back";

  // Today
  const todayEntries = entries.filter((e) => e.startedAt.toDateString() === todayStr);
  const todayTotal = todayEntries.reduce((s, e) => s + e.duration, 0);

  // This week
  const weekStart = new Date(now);
  const day = weekStart.getDay();
  weekStart.setDate(weekStart.getDate() - day + (day === 0 ? -6 : 1));
  weekStart.setHours(0, 0, 0, 0);
  const weekEntries = entries.filter((e) => e.startedAt >= weekStart);
  const weekTotal = weekEntries.reduce((s, e) => s + e.duration, 0);

  // Last week for comparison
  const lastWeekStart = new Date(weekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  const lastWeekEntries = entries.filter((e) => e.startedAt >= lastWeekStart && e.startedAt < weekStart);
  const lastWeekTotal = lastWeekEntries.reduce((s, e) => s + e.duration, 0);
  const weekChange = lastWeekTotal > 0 ? ((weekTotal - lastWeekTotal) / lastWeekTotal) * 100 : 0;

  // This month earnings
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const thisMonthPaid = invoices.filter((i) => i.status === "paid" && i.paidAt && i.paidAt >= monthStart).reduce((s, i) => s + getInvoiceTotal(i), 0);
  const lastMonthPaid = invoices.filter((i) => i.status === "paid" && i.paidAt && i.paidAt >= lastMonthStart && i.paidAt < monthStart).reduce((s, i) => s + getInvoiceTotal(i), 0);
  const monthChange = lastMonthPaid > 0 ? ((thisMonthPaid - lastMonthPaid) / lastMonthPaid) * 100 : 0;

  // Invoice stats
  const overdueInvoices = invoices.filter((i) => (i.status === "sent" && i.dueDate < now) || i.status === "overdue");
  const unpaidTotal = invoices.filter((i) => i.status !== "paid").reduce((s, i) => s + getInvoiceTotal(i), 0);
  const paidTotal = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + getInvoiceTotal(i), 0);

  // Recent entries
  const recentEntries = entries.slice(0, 5);

  // Top projects this week
  const projectTime = new Map<string, number>();
  weekEntries.forEach((e) => {
    const key = e.projectId || "__none__";
    projectTime.set(key, (projectTime.get(key) || 0) + e.duration);
  });
  const topProjects = Array.from(projectTime.entries())
    .map(([id, duration]) => ({ project: id === "__none__" ? null : getProjectById(id), duration }))
    .sort((a, b) => b.duration - a.duration)
    .slice(0, 5);

  const isEmpty = entries.length === 0 && projects.length === 0 && clients.length === 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{greeting} 👋</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Running timer indicator */}
      {isTimerRunning && (
        <Link to="/app/timer">
          <Card className="border-emerald-200 bg-emerald-50">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <div>
                  <span className="text-sm font-medium">{timerDescription || "Timer running"}</span>
                  <span className="text-xs text-muted-foreground ml-2">{formatDuration(timerSeconds)}</span>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-emerald-600" />
            </CardContent>
          </Card>
        </Link>
      )}

      {/* Overdue alert */}
      {overdueInvoices.length > 0 && (
        <Link to="/app/invoices">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium text-red-700">
                  {overdueInvoices.length} overdue invoice{overdueInvoices.length > 1 ? "s" : ""} — ${overdueInvoices.reduce((s, i) => s + getInvoiceTotal(i), 0).toFixed(0)}
                </span>
              </div>
              <ArrowRight className="h-4 w-4 text-red-400" />
            </CardContent>
          </Card>
        </Link>
      )}

      {/* Empty state onboarding */}
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
          {/* Stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Clock className="h-4 w-4" />
                  <span className="text-xs">Today</span>
                </div>
                <p className="text-2xl font-bold">{formatDuration(todayTotal)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-xs">This Week</span>
                  </div>
                  {weekChange !== 0 && (
                    <span className={`text-[10px] font-medium ${weekChange > 0 ? "text-emerald-600" : "text-red-500"}`}>
                      {weekChange > 0 ? "+" : ""}{weekChange.toFixed(0)}%
                    </span>
                  )}
                </div>
                <p className="text-2xl font-bold">{formatDuration(weekTotal)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <FileText className="h-4 w-4" />
                  <span className="text-xs">Unpaid</span>
                </div>
                <p className="text-2xl font-bold">${unpaidTotal.toFixed(0)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span className="text-xs">This Month</span>
                  </div>
                  {monthChange !== 0 && (
                    <span className={`text-[10px] font-medium ${monthChange > 0 ? "text-emerald-600" : "text-red-500"}`}>
                      {monthChange > 0 ? "+" : ""}{monthChange.toFixed(0)}%
                    </span>
                  )}
                </div>
                <p className="text-2xl font-bold text-emerald-600">${thisMonthPaid.toFixed(0)}</p>
              </CardContent>
            </Card>
          </div>

          {/* Activity Graph */}
          <ActivityGraph entries={entries} />

          {/* Quick start + links */}
          <div className="grid grid-cols-4 gap-3">
            <Link to="/app/timer">
              <Card className="hover:bg-emerald-50 hover:border-emerald-200 transition-colors cursor-pointer">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Play className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-medium">Start Timer</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link to="/app/projects">
              <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FolderKanban className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{projects.length} Projects</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link to="/app/clients">
              <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{clients.length} Clients</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link to="/app/invoices">
              <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{invoices.length} Invoices</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Recent Activity</CardTitle>
                <Link to="/app/timer"><Button variant="ghost" size="sm">View all</Button></Link>
              </CardHeader>
              <CardContent>
                {recentEntries.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">No entries yet.</p>
                ) : (
                  <div className="space-y-3">
                    {recentEntries.map((entry) => {
                      const project = getProjectById(entry.projectId);
                      return (
                        <div key={entry.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {project && <div className="h-2 w-2 rounded-full" style={{ backgroundColor: project.color }} />}
                            <div>
                              <p className="text-sm font-medium">{entry.description}</p>
                              <p className="text-xs text-muted-foreground">{project?.name || "No project"}</p>
                            </div>
                          </div>
                          <span className="text-sm font-mono">{formatDuration(entry.duration)}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top projects */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Top Projects (Week)</CardTitle>
                <Link to="/app/reports"><Button variant="ghost" size="sm">Reports</Button></Link>
              </CardHeader>
              <CardContent>
                {topProjects.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">No data this week.</p>
                ) : (
                  <div className="space-y-3">
                    {topProjects.map(({ project, duration }, i) => {
                      const maxDuration = topProjects[0]?.duration || 1;
                      return (
                        <div key={i} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: project?.color || "#71717a" }} />
                              <span className="font-medium">{project?.name || "No project"}</span>
                            </div>
                            <span className="text-muted-foreground">{formatDuration(duration)}</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-muted">
                            <div className="h-1.5 rounded-full" style={{ width: `${(duration / maxDuration) * 100}%`, backgroundColor: project?.color || "#71717a" }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
