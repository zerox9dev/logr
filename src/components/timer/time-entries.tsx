import { useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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

function parseDuration(str: string): number | null {
  // "1h 30m" or "1:30" or "90m" or "90"
  const hm = str.match(/^(\d+)h\s*(\d+)m?$/i);
  if (hm) return parseInt(hm[1]) * 3600 + parseInt(hm[2]) * 60;
  const colon = str.match(/^(\d+):(\d{1,2})$/);
  if (colon) return parseInt(colon[1]) * 3600 + parseInt(colon[2]) * 60;
  const hOnly = str.match(/^(\d+)h$/i);
  if (hOnly) return parseInt(hOnly[1]) * 3600;
  const mOnly = str.match(/^(\d+)m?$/i);
  if (mOnly) return parseInt(mOnly[1]) * 60;
  return null;
}

function durationToStr(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

interface TimeEntriesProps {
  entries: TimeEntry[];
  projects: Project[];
  getProjectById: (id: string | null) => Project | undefined;
  onUpdate: (id: string, data: Partial<TimeEntry>) => void;
  onDelete: (id: string) => void;
  onAdd: (data: Omit<TimeEntry, "id">) => void;
}

export function TimeEntries({ entries, projects, getProjectById, onUpdate, onDelete, onAdd }: TimeEntriesProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showManual, setShowManual] = useState(false);

  // Edit form state
  const [editDesc, setEditDesc] = useState("");
  const [editDuration, setEditDuration] = useState("");
  const [editProjectId, setEditProjectId] = useState("");

  // Manual form state
  const [manualDesc, setManualDesc] = useState("");
  const [manualDuration, setManualDuration] = useState("");
  const [manualProjectId, setManualProjectId] = useState("");

  const today = entries.filter(
    (e) => e.startedAt.toDateString() === new Date().toDateString()
  );
  const totalSeconds = today.reduce((sum, e) => sum + e.duration, 0);

  const startEdit = (entry: TimeEntry) => {
    setEditingId(entry.id);
    setEditDesc(entry.description);
    setEditDuration(durationToStr(entry.duration));
    setEditProjectId(entry.projectId || "");
  };

  const saveEdit = () => {
    if (!editingId) return;
    const dur = parseDuration(editDuration);
    if (!dur || dur <= 0) return;
    onUpdate(editingId, {
      description: editDesc || "Untitled",
      duration: dur,
      projectId: editProjectId || null,
    });
    setEditingId(null);
  };

  const handleManual = (e: React.FormEvent) => {
    e.preventDefault();
    const dur = parseDuration(manualDuration);
    if (!dur || dur <= 0) return;
    onAdd({
      description: manualDesc || "Untitled",
      duration: dur,
      projectId: manualProjectId || null,
      startedAt: new Date(),
    });
    setManualDesc("");
    setManualDuration("");
    setManualProjectId("");
    setShowManual(false);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Today</CardTitle>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              Total: {formatDuration(totalSeconds)}
            </span>
            <Button variant="outline" size="sm" onClick={() => setShowManual(true)}>
              <Plus className="h-3 w-3" /> Manual
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {today.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No entries yet. Start the timer or add manually.
            </p>
          ) : (
            <div className="space-y-2">
              {today.map((entry) => {
                const project = getProjectById(entry.projectId);
                const isEditing = editingId === entry.id;

                if (isEditing) {
                  return (
                    <div key={entry.id} className="flex items-center gap-2 rounded-lg border border-primary/50 p-3">
                      <Input
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        placeholder="Description"
                        className="flex-1"
                        autoFocus
                      />
                      <select
                        value={editProjectId}
                        onChange={(e) => setEditProjectId(e.target.value)}
                        className="h-9 rounded-md border border-input bg-transparent px-2 text-sm"
                      >
                        <option value="">No project</option>
                        {projects.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                      <Input
                        value={editDuration}
                        onChange={(e) => setEditDuration(e.target.value)}
                        placeholder="1h 30m"
                        className="w-24"
                      />
                      <Button size="sm" onClick={saveEdit}>Save</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                    </div>
                  );
                }

                return (
                  <div
                    key={entry.id}
                    className="group flex items-center justify-between rounded-lg border border-border p-3 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {project && (
                        <div
                          className="h-2.5 w-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: project.color }}
                        />
                      )}
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium">{entry.description}</span>
                        {project && (
                          <span className="text-xs text-muted-foreground">{project.name}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {formatTimeRange(entry.startedAt, entry.duration)}
                      </span>
                      <span className="font-mono text-sm font-medium min-w-[60px] text-right">
                        {formatDuration(entry.duration)}
                      </span>
                      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(entry)}>
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onDelete(entry.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manual entry dialog */}
      <Dialog open={showManual} onClose={() => setShowManual(false)} title="Add Time Entry">
        <form onSubmit={handleManual} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Input
              value={manualDesc}
              onChange={(e) => setManualDesc(e.target.value)}
              placeholder="What did you work on?"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Duration</label>
              <Input
                value={manualDuration}
                onChange={(e) => setManualDuration(e.target.value)}
                placeholder="1h 30m, 1:30, or 90m"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Project</label>
              <select
                value={manualProjectId}
                onChange={(e) => setManualProjectId(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">No project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => setShowManual(false)}>Cancel</Button>
            <Button type="submit">Add Entry</Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
