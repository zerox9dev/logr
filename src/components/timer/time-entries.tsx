import { useState } from "react";
import { Pencil, Trash2, Plus, DollarSign } from "lucide-react";
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

function getDateLabel(date: Date): string {
  const now = new Date();
  const today = now.toDateString();
  const yesterday = new Date(now.getTime() - 86400000).toDateString();
  const ds = date.toDateString();
  if (ds === today) return "Today";
  if (ds === yesterday) return "Yesterday";
  return date.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" });
}

function groupByDate(entries: TimeEntry[]): Map<string, TimeEntry[]> {
  const groups = new Map<string, TimeEntry[]>();
  entries.forEach((e) => {
    const key = e.startedAt.toDateString();
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(e);
  });
  return groups;
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

  const [editDesc, setEditDesc] = useState("");
  const [editDuration, setEditDuration] = useState("");
  const [editProjectId, setEditProjectId] = useState("");
  const [editBillable, setEditBillable] = useState(true);

  const [manualDesc, setManualDesc] = useState("");
  const [manualDuration, setManualDuration] = useState("");
  const [manualProjectId, setManualProjectId] = useState("");
  const [manualBillable, setManualBillable] = useState(true);

  const grouped = groupByDate(entries);

  const startEdit = (entry: TimeEntry) => {
    setEditingId(entry.id);
    setEditDesc(entry.description);
    setEditDuration(durationToStr(entry.duration));
    setEditProjectId(entry.projectId || "");
    setEditBillable(entry.billable);
  };

  const saveEdit = () => {
    if (!editingId) return;
    const dur = parseDuration(editDuration);
    if (!dur || dur <= 0) return;
    onUpdate(editingId, {
      description: editDesc || "Untitled",
      duration: dur,
      projectId: editProjectId || null,
      billable: editBillable,
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
      billable: manualBillable,
    });
    setManualDesc("");
    setManualDuration("");
    setManualProjectId("");
    setManualBillable(true);
    setShowManual(false);
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Time Entries</h2>
        <Button variant="outline" size="sm" onClick={() => setShowManual(true)}>
          <Plus className="h-3 w-3" /> Manual
        </Button>
      </div>

      {entries.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-sm text-muted-foreground">No entries yet. Start the timer or add manually.</p>
          </CardContent>
        </Card>
      ) : (
        Array.from(grouped.entries()).map(([dateStr, dateEntries]) => {
          const totalSeconds = dateEntries.reduce((s, e) => s + e.duration, 0);
          const billableSeconds = dateEntries.filter((e) => e.billable).reduce((s, e) => s + e.duration, 0);

          return (
            <Card key={dateStr}>
              <CardHeader className="flex flex-row items-center justify-between py-3">
                <CardTitle className="text-sm font-medium">
                  {getDateLabel(dateEntries[0].startedAt)}
                </CardTitle>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {billableSeconds < totalSeconds && (
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" /> {formatDuration(billableSeconds)}
                    </span>
                  )}
                  <span>Total: {formatDuration(totalSeconds)}</span>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {dateEntries.map((entry) => {
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
                            onKeyDown={(e) => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") setEditingId(null); }}
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
                          <button
                            onClick={() => setEditBillable(!editBillable)}
                            className={`flex items-center justify-center h-8 w-8 rounded-md border transition-colors ${
                              editBillable ? "border-emerald-500 text-emerald-600 bg-emerald-50" : "border-border text-muted-foreground"
                            }`}
                          >
                            <DollarSign className="h-3 w-3" />
                          </button>
                          <Input
                            value={editDuration}
                            onChange={(e) => setEditDuration(e.target.value)}
                            placeholder="1h 30m"
                            className="w-24"
                            onKeyDown={(e) => { if (e.key === "Enter") saveEdit(); }}
                          />
                          <Button size="sm" onClick={saveEdit}>Save</Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>✕</Button>
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
                            <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: project.color }} />
                          )}
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-medium">{entry.description}</span>
                              {!entry.billable && (
                                <span className="text-[10px] text-muted-foreground border border-border rounded px-1">non-billable</span>
                              )}
                            </div>
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
              </CardContent>
            </Card>
          );
        })
      )}

      <Dialog open={showManual} onClose={() => setShowManual(false)} title="Add Time Entry">
        <form onSubmit={handleManual} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Input value={manualDesc} onChange={(e) => setManualDesc(e.target.value)} placeholder="What did you work on?" autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Duration</label>
              <Input value={manualDuration} onChange={(e) => setManualDuration(e.target.value)} placeholder="1h 30m, 1:30, or 90m" />
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
          <label className="flex items-center gap-2 cursor-pointer">
            <button
              type="button"
              onClick={() => setManualBillable(!manualBillable)}
              className={`flex items-center justify-center h-8 w-8 rounded-md border transition-colors ${
                manualBillable ? "border-emerald-500 text-emerald-600 bg-emerald-50" : "border-border text-muted-foreground"
              }`}
            >
              <DollarSign className="h-3.5 w-3.5" />
            </button>
            <span className="text-sm">{manualBillable ? "Billable" : "Non-billable"}</span>
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => setShowManual(false)}>Cancel</Button>
            <Button type="submit">Add Entry</Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
