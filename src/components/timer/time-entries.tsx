import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TimeEntry, Project } from "@/types";

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function formatTimeRange(start: Date, duration: number): string {
  const end = new Date(start.getTime() + duration * 1000);
  const fmt = (d: Date) =>
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return `${fmt(start)} — ${fmt(end)}`;
}

interface TimeEntriesProps {
  entries: TimeEntry[];
  getProjectById: (id: string | null) => Project | undefined;
}

export function TimeEntries({ entries, getProjectById }: TimeEntriesProps) {
  const today = entries.filter(
    (e) => e.startedAt.toDateString() === new Date().toDateString()
  );

  const totalSeconds = today.reduce((sum, e) => sum + e.duration, 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Today</CardTitle>
        <span className="text-sm text-muted-foreground">
          Total: {formatDuration(totalSeconds)}
        </span>
      </CardHeader>
      <CardContent>
        {today.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            No entries yet. Start the timer above.
          </p>
        ) : (
          <div className="space-y-3">
            {today.map((entry) => {
              const project = getProjectById(entry.projectId);
              return (
                <div
                  key={entry.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {project && (
                      <div
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: project.color }}
                      />
                    )}
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium">
                        {entry.description}
                      </span>
                      {project && (
                        <span className="text-xs text-muted-foreground">
                          {project.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground">
                      {formatTimeRange(entry.startedAt, entry.duration)}
                    </span>
                    <span className="font-mono text-sm font-medium min-w-[60px] text-right">
                      {formatDuration(entry.duration)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
