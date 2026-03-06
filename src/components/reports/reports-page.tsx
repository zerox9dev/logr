import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TimeEntry, Project, Client } from "@/types";

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function getWeekStart(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const start = new Date(now.setDate(diff));
  start.setHours(0, 0, 0, 0);
  return start;
}

interface ReportsPageProps {
  entries: TimeEntry[];
  projects: Project[];
  clients: Client[];
  getProjectById: (id: string | null) => Project | undefined;
}

export function ReportsPage({ entries, projects, getProjectById }: ReportsPageProps) {
  const now = new Date();
  const todayStr = now.toDateString();
  const weekStart = getWeekStart();

  const todayEntries = entries.filter((e) => e.startedAt.toDateString() === todayStr);
  const weekEntries = entries.filter((e) => e.startedAt >= weekStart);

  const todayTotal = todayEntries.reduce((s, e) => s + e.duration, 0);
  const weekTotal = weekEntries.reduce((s, e) => s + e.duration, 0);
  const allTotal = entries.reduce((s, e) => s + e.duration, 0);

  // Time by project
  const projectTime = new Map<string, number>();
  entries.forEach((e) => {
    const key = e.projectId || "__none__";
    projectTime.set(key, (projectTime.get(key) || 0) + e.duration);
  });

  const projectStats = Array.from(projectTime.entries())
    .map(([id, duration]) => ({
      project: id === "__none__" ? null : getProjectById(id),
      duration,
      percentage: allTotal > 0 ? (duration / allTotal) * 100 : 0,
    }))
    .sort((a, b) => b.duration - a.duration);

  // Daily breakdown (last 7 days)
  const dailyData: { label: string; seconds: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toDateString();
    const dayEntries = entries.filter((e) => e.startedAt.toDateString() === dateStr);
    const total = dayEntries.reduce((s, e) => s + e.duration, 0);
    dailyData.push({
      label: date.toLocaleDateString([], { weekday: "short" }),
      seconds: total,
    });
  }
  const maxDaily = Math.max(...dailyData.map((d) => d.seconds), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-sm text-muted-foreground mt-1">Your time at a glance.</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Today</p>
            <p className="text-xl font-bold mt-1">{formatDuration(todayTotal)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">This Week</p>
            <p className="text-xl font-bold mt-1">{formatDuration(weekTotal)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">All Time</p>
            <p className="text-xl font-bold mt-1">{formatDuration(allTotal)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly bar chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Last 7 Days</CardTitle>
        </CardHeader>
        <CardContent>
          {allTotal === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No data yet. Start tracking time to see reports.
            </p>
          ) : (
            <div className="flex items-end gap-2 h-32">
              {dailyData.map((day, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-muted rounded-t" style={{ height: "100%" }}>
                    <div
                      className="w-full bg-primary rounded-t transition-all"
                      style={{
                        height: `${(day.seconds / maxDaily) * 100}%`,
                        minHeight: day.seconds > 0 ? "4px" : "0",
                      }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{day.label}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* By project */}
      {projectStats.length > 0 && allTotal > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">By Project</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {projectStats.map(({ project, duration, percentage }, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: project?.color || "#71717a" }}
                    />
                    <span className="font-medium">{project?.name || "No project"}</span>
                  </div>
                  <span className="text-muted-foreground">
                    {formatDuration(duration)} ({percentage.toFixed(0)}%)
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: project?.color || "#71717a",
                    }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
