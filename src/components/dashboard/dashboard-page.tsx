import { Clock, FolderKanban, Users, FileText, TrendingUp, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { TimeEntry, Project, Client, Invoice } from "@/types";

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m`;
  return "0m";
}

function getInvoiceTotal(invoice: Invoice): number {
  return invoice.items.reduce((sum, item) => sum + item.hours * item.rate, 0);
}

interface DashboardPageProps {
  entries: TimeEntry[];
  projects: Project[];
  clients: Client[];
  invoices: Invoice[];
  getProjectById: (id: string | null) => Project | undefined;
}

export function DashboardPage({ entries, projects, clients, invoices, getProjectById }: DashboardPageProps) {
  const now = new Date();
  const todayStr = now.toDateString();

  // Today stats
  const todayEntries = entries.filter((e) => e.startedAt.toDateString() === todayStr);
  const todayTotal = todayEntries.reduce((s, e) => s + e.duration, 0);

  // This week
  const weekStart = new Date(now);
  const day = weekStart.getDay();
  weekStart.setDate(weekStart.getDate() - day + (day === 0 ? -6 : 1));
  weekStart.setHours(0, 0, 0, 0);
  const weekEntries = entries.filter((e) => e.startedAt >= weekStart);
  const weekTotal = weekEntries.reduce((s, e) => s + e.duration, 0);

  // Invoice stats
  const unpaidInvoices = invoices.filter((i) => i.status === "sent" || i.status === "overdue");
  const unpaidTotal = unpaidInvoices.reduce((s, i) => s + getInvoiceTotal(i), 0);
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
    .map(([id, duration]) => ({
      project: id === "__none__" ? null : getProjectById(id),
      duration,
    }))
    .sort((a, b) => b.duration - a.duration)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </div>

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
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs">This Week</span>
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
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <FileText className="h-4 w-4" />
              <span className="text-xs">Earned</span>
            </div>
            <p className="text-2xl font-bold text-emerald-600">${paidTotal.toFixed(0)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-3 gap-3">
        <Link to="/projects">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderKanban className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{projects.length} Projects</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
        <Link to="/clients">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{clients.length} Clients</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
        <Link to="/invoices">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{invoices.length} Invoices</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent time entries */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Activity</CardTitle>
            <Link to="/">
              <Button variant="ghost" size="sm">View all</Button>
            </Link>
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
                        {project && (
                          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: project.color }} />
                        )}
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

        {/* Top projects this week */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Top Projects (Week)</CardTitle>
            <Link to="/reports">
              <Button variant="ghost" size="sm">Reports</Button>
            </Link>
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
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: project?.color || "#71717a" }}
                          />
                          <span className="font-medium">{project?.name || "No project"}</span>
                        </div>
                        <span className="text-muted-foreground">{formatDuration(duration)}</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-muted">
                        <div
                          className="h-1.5 rounded-full"
                          style={{
                            width: `${(duration / maxDuration) * 100}%`,
                            backgroundColor: project?.color || "#71717a",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
