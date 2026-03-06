import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TimeEntry {
  id: string;
  description: string;
  project: string;
  duration: number;
  startedAt: Date;
}

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
}

export function TimeEntries({ entries }: TimeEntriesProps) {
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
            {today.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-accent/50 transition-colors"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-foreground">
                    {entry.description}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {entry.project}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-muted-foreground">
                    {formatTimeRange(entry.startedAt, entry.duration)}
                  </span>
                  <span className="font-mono text-sm font-medium text-foreground min-w-[60px] text-right">
                    {formatDuration(entry.duration)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
