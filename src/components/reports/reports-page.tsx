import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppData } from "@/lib/data-context";

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function ReportsPage() {
  const { sessions, projects, clients, getProjectById } = useAppData();
  const [range, setRange] = useState<"week" | "month" | "all">("week");

  const now = new Date();
  let startDate: Date | null = null;
  if (range === "week") {
    startDate = new Date(now);
    const day = startDate.getDay();
    startDate.setDate(startDate.getDate() - day + (day === 0 ? -6 : 1));
    startDate.setHours(0, 0, 0, 0);
  } else if (range === "month") {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  const startStr = startDate?.toISOString() || "";
  const filtered = startStr ? sessions.filter((s) => s.started_at >= startStr) : sessions;

  const totalSeconds = filtered.reduce((s, e) => s + e.duration_seconds, 0);
  const billableSeconds = filtered.filter((s) => s.billing_type === "hourly").reduce((s, e) => s + e.duration_seconds, 0);
  const earnings = filtered.reduce((s, e) => s + (e.duration_seconds / 3600) * Number(e.rate), 0);

  // By project
  const projectMap = new Map<string, number>();
  filtered.forEach((s) => {
    const key = s.project_id || "__none__";
    projectMap.set(key, (projectMap.get(key) || 0) + s.duration_seconds);
  });
  const topProjects = Array.from(projectMap.entries())
    .map(([id, dur]) => ({ project: id === "__none__" ? null : getProjectById(id), duration: dur }))
    .sort((a, b) => b.duration - a.duration);

  // By client
  const clientMap = new Map<string, number>();
  filtered.forEach((s) => {
    const key = s.client_id || "__none__";
    clientMap.set(key, (clientMap.get(key) || 0) + s.duration_seconds);
  });
  const topClients = Array.from(clientMap.entries())
    .map(([id, dur]) => ({ client: id === "__none__" ? null : clients.find((c) => c.id === id), duration: dur }))
    .sort((a, b) => b.duration - a.duration);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Reports</h1>
        <div className="flex gap-1">
          {(["week", "month", "all"] as const).map((r) => (
            <Button key={r} variant={range === r ? "default" : "ghost"} size="sm" onClick={() => setRange(r)} className="capitalize">{r}</Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="p-5">
          <p className="text-xs text-muted-foreground font-medium">Total Time</p>
          <p className="text-2xl font-bold mt-1">{formatDuration(totalSeconds)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <p className="text-xs text-muted-foreground font-medium">Billable</p>
          <p className="text-2xl font-bold mt-1">{formatDuration(billableSeconds)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <p className="text-xs text-muted-foreground font-medium">Earnings</p>
          <p className="text-2xl font-bold mt-1 text-emerald-600">${earnings.toFixed(0)}</p>
        </CardContent></Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-lg">By Project</CardTitle></CardHeader>
          <CardContent>
            {topProjects.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No data.</p>
            ) : (
              <div className="space-y-3">
                {topProjects.map(({ project, duration }, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{project?.name || "No project"}</span>
                      <span className="text-muted-foreground">{formatDuration(duration)}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-muted">
                      <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: `${(duration / (topProjects[0]?.duration || 1)) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">By Client</CardTitle></CardHeader>
          <CardContent>
            {topClients.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No data.</p>
            ) : (
              <div className="space-y-3">
                {topClients.map(({ client, duration }, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{client?.name || "No client"}</span>
                      <span className="text-muted-foreground">{formatDuration(duration)}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-muted">
                      <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${(duration / (topClients[0]?.duration || 1)) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
