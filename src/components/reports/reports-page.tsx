import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { TimeEntry, Project, Client } from "@/types";

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function startOfDay(d: Date): Date {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
}

function getWeekStart(d: Date): Date {
  const r = new Date(d);
  const day = r.getDay();
  r.setDate(r.getDate() - day + (day === 0 ? -6 : 1));
  r.setHours(0, 0, 0, 0);
  return r;
}

function getMonthStart(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

type RangePreset = "week" | "month" | "all" | "custom";

interface ReportsPageProps {
  entries: TimeEntry[];
  projects: Project[];
  clients: Client[];
  getProjectById: (id: string | null) => Project | undefined;
}

export function ReportsPage({ entries, projects, clients, getProjectById }: ReportsPageProps) {
  const now = new Date();
  const [rangePreset, setRangePreset] = useState<RangePreset>("week");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [filterProjectId, setFilterProjectId] = useState("");
  const [filterClientId, setFilterClientId] = useState("");

  // Date range
  let rangeStart: Date;
  let rangeEnd: Date = now;
  switch (rangePreset) {
    case "week": rangeStart = getWeekStart(now); break;
    case "month": rangeStart = getMonthStart(now); break;
    case "all": rangeStart = new Date(0); break;
    case "custom":
      rangeStart = customFrom ? startOfDay(new Date(customFrom)) : new Date(0);
      rangeEnd = customTo ? new Date(new Date(customTo).getTime() + 86400000 - 1) : now;
      break;
  }

  // Filter entries
  let filtered = entries.filter((e) => e.startedAt >= rangeStart && e.startedAt <= rangeEnd);

  if (filterProjectId) {
    filtered = filtered.filter((e) => e.projectId === filterProjectId);
  }

  if (filterClientId) {
    const clientProjectIds = new Set(projects.filter((p) => p.clientId === filterClientId).map((p) => p.id));
    filtered = filtered.filter((e) => e.projectId && clientProjectIds.has(e.projectId));
  }

  const totalSeconds = filtered.reduce((s, e) => s + e.duration, 0);
  const billableSeconds = filtered.filter((e) => e.billable).reduce((s, e) => s + e.duration, 0);
  const nonBillableSeconds = totalSeconds - billableSeconds;

  // Earnings
  let totalEarnings = 0;
  filtered.forEach((e) => {
    if (e.billable && e.projectId) {
      const proj = getProjectById(e.projectId);
      if (proj?.hourlyRate) {
        totalEarnings += (e.duration / 3600) * proj.hourlyRate;
      }
    }
  });

  const avgPerDay = (() => {
    if (filtered.length === 0) return 0;
    const days = new Set(filtered.map((e) => e.startedAt.toDateString())).size;
    return days > 0 ? totalSeconds / days : 0;
  })();

  // By project
  const projectTime = new Map<string, number>();
  filtered.forEach((e) => {
    const key = e.projectId || "__none__";
    projectTime.set(key, (projectTime.get(key) || 0) + e.duration);
  });

  const projectStats = Array.from(projectTime.entries())
    .map(([id, duration]) => ({
      project: id === "__none__" ? null : getProjectById(id),
      duration,
      percentage: totalSeconds > 0 ? (duration / totalSeconds) * 100 : 0,
    }))
    .sort((a, b) => b.duration - a.duration);

  // By client
  const clientTime = new Map<string, number>();
  filtered.forEach((e) => {
    if (e.projectId) {
      const proj = getProjectById(e.projectId);
      const cid = proj?.clientId || "__none__";
      clientTime.set(cid, (clientTime.get(cid) || 0) + e.duration);
    } else {
      clientTime.set("__none__", (clientTime.get("__none__") || 0) + e.duration);
    }
  });

  const clientStats = Array.from(clientTime.entries())
    .map(([id, duration]) => ({
      client: id === "__none__" ? null : clients.find((c) => c.id === id),
      duration,
      percentage: totalSeconds > 0 ? (duration / totalSeconds) * 100 : 0,
    }))
    .sort((a, b) => b.duration - a.duration);

  // Daily chart
  const dayCount = rangePreset === "week" ? 7 : rangePreset === "month" ? 30 : Math.min(14, Math.ceil((rangeEnd.getTime() - rangeStart.getTime()) / 86400000) + 1);
  const dailyData: { label: string; seconds: number }[] = [];
  for (let i = dayCount - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    if (date < rangeStart) continue;
    const dateStr = date.toDateString();
    const dayEntries = filtered.filter((e) => e.startedAt.toDateString() === dateStr);
    dailyData.push({
      label: date.toLocaleDateString([], { weekday: "short", day: "numeric" }),
      seconds: dayEntries.reduce((s, e) => s + e.duration, 0),
    });
  }
  const maxDaily = Math.max(...dailyData.map((d) => d.seconds), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-sm text-muted-foreground mt-1">Your time and earnings at a glance.</p>
      </div>

      {/* Range + Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {(["week", "month", "all", "custom"] as RangePreset[]).map((r) => (
          <Button key={r} variant={rangePreset === r ? "default" : "ghost"} size="sm"
            onClick={() => setRangePreset(r)}>
            {r === "week" ? "This Week" : r === "month" ? "This Month" : r === "all" ? "All Time" : "Custom"}
          </Button>
        ))}
        {rangePreset === "custom" && (
          <>
            <Input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className="w-36 h-8" />
            <span className="text-sm text-muted-foreground">to</span>
            <Input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} className="w-36 h-8" />
          </>
        )}

        <div className="ml-auto flex gap-2">
          <select value={filterProjectId} onChange={(e) => setFilterProjectId(e.target.value)}
            className="h-8 rounded-lg border border-input bg-white px-2 text-xs">
            <option value="">All projects</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select value={filterClientId} onChange={(e) => setFilterClientId(e.target.value)}
            className="h-8 rounded-lg border border-input bg-white px-2 text-xs">
            <option value="">All clients</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-xl font-bold mt-1">{formatDuration(totalSeconds)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Billable</p>
          <p className="text-xl font-bold mt-1">{formatDuration(billableSeconds)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Non-billable</p>
          <p className="text-xl font-bold mt-1">{formatDuration(nonBillableSeconds)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Earnings</p>
          <p className="text-xl font-bold mt-1 text-emerald-600">${totalEarnings.toFixed(0)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Avg / Day</p>
          <p className="text-xl font-bold mt-1">{formatDuration(avgPerDay)}</p>
        </CardContent></Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Daily Breakdown</CardTitle></CardHeader>
        <CardContent>
          {dailyData.length === 0 || totalSeconds === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No data for this period.</p>
          ) : (
            <div className="flex items-end gap-1.5 h-32">
              {dailyData.map((day, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 min-w-0">
                  <div className="w-full bg-muted rounded-t relative" style={{ height: "100%" }}>
                    <div className="w-full bg-primary rounded-t transition-all absolute bottom-0"
                      style={{ height: `${(day.seconds / maxDaily) * 100}%`, minHeight: day.seconds > 0 ? "4px" : "0" }} />
                  </div>
                  <span className="text-[10px] text-muted-foreground truncate w-full text-center">{day.label}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* By project */}
        {projectStats.length > 0 && totalSeconds > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-lg">By Project</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {projectStats.map(({ project, duration, percentage }, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: project?.color || "#71717a" }} />
                      <span className="font-medium">{project?.name || "No project"}</span>
                    </div>
                    <span className="text-muted-foreground">{formatDuration(duration)} ({percentage.toFixed(0)}%)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div className="h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%`, backgroundColor: project?.color || "#71717a" }} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* By client */}
        {clientStats.length > 0 && totalSeconds > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-lg">By Client</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {clientStats.map(({ client, duration, percentage }, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{client?.name || "No client"}</span>
                    <span className="text-muted-foreground">{formatDuration(duration)} ({percentage.toFixed(0)}%)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
