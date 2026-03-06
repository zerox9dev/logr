import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { Project, Client, ProjectStatus, TimeEntry } from "@/types";

const PROJECT_COLORS = [
  "#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6",
  "#ec4899", "#06b6d4", "#f97316", "#6366f1", "#14b8a6",
  "#84cc16", "#f43f5e", "#0ea5e9", "#a855f7", "#22c55e",
];

const STATUS_LABELS: Record<ProjectStatus, { label: string; variant: "default" | "secondary" | "outline" }> = {
  active: { label: "Active", variant: "default" },
  completed: { label: "Completed", variant: "secondary" },
  archived: { label: "Archived", variant: "outline" },
};

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

interface ProjectsPageProps {
  projects: Project[];
  clients: Client[];
  entries: TimeEntry[];
  onAdd: (data: { name: string; clientId: string | null; hourlyRate: number | null; color?: string; status?: ProjectStatus; budgetHours?: number | null; notes?: string }) => void;
  onUpdate: (id: string, data: Partial<Project>) => void;
  onDelete: (id: string) => void;
  getClientById: (id: string | null) => Client | undefined;
}

type FilterStatus = "all" | ProjectStatus;

export function ProjectsPage({ projects, clients, entries, onAdd, onUpdate, onDelete, getClientById }: ProjectsPageProps) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterStatus>("all");

  const [name, setName] = useState("");
  const [clientId, setClientId] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [color, setColor] = useState(PROJECT_COLORS[0]);
  const [status, setStatus] = useState<ProjectStatus>("active");
  const [budgetHours, setBudgetHours] = useState("");
  const [notes, setNotes] = useState("");

  const resetForm = () => {
    setName("");
    setClientId("");
    setHourlyRate("");
    setColor(PROJECT_COLORS[projects.length % PROJECT_COLORS.length]);
    setStatus("active");
    setBudgetHours("");
    setNotes("");
    setEditId(null);
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const data = {
      name: name.trim(),
      clientId: clientId || null,
      hourlyRate: hourlyRate ? Number(hourlyRate) : null,
      color,
      status,
      budgetHours: budgetHours ? Number(budgetHours) : null,
      notes,
    };

    if (editId) {
      onUpdate(editId, data);
    } else {
      onAdd(data);
    }
    resetForm();
  };

  const handleEdit = (project: Project) => {
    setName(project.name);
    setClientId(project.clientId || "");
    setHourlyRate(project.hourlyRate?.toString() || "");
    setColor(project.color);
    setStatus(project.status);
    setBudgetHours(project.budgetHours?.toString() || "");
    setNotes(project.notes);
    setEditId(project.id);
    setShowForm(true);
  };

  // Compute hours per project
  const projectHours = new Map<string, number>();
  entries.forEach((e) => {
    if (e.projectId) {
      projectHours.set(e.projectId, (projectHours.get(e.projectId) || 0) + e.duration);
    }
  });

  const filtered = filter === "all" ? projects : projects.filter((p) => p.status === filter);
  const activeCounts = { all: projects.length, active: 0, completed: 0, archived: 0 };
  projects.forEach((p) => activeCounts[p.status]++);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filtered.length} project{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus className="h-4 w-4" /> New Project
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1">
        {(["all", "active", "completed", "archived"] as FilterStatus[]).map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilter(f)}
          >
            {f === "all" ? "All" : STATUS_LABELS[f].label} ({activeCounts[f]})
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              {projects.length === 0 ? "No projects yet. Create your first one." : "No projects match this filter."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map((project) => {
            const client = getClientById(project.clientId);
            const totalSec = projectHours.get(project.id) || 0;
            const totalHrs = totalSec / 3600;
            const earned = project.hourlyRate ? totalHrs * project.hourlyRate : 0;
            const budgetPct = project.budgetHours ? Math.min((totalHrs / project.budgetHours) * 100, 100) : null;
            const statusConf = STATUS_LABELS[project.status];

            return (
              <Card key={project.id}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: project.color }} />
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{project.name}</span>
                        <Badge variant={statusConf.variant} className="text-[10px]">{statusConf.label}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {project.hourlyRate && (
                        <Badge variant="secondary">${project.hourlyRate}/hr</Badge>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(project)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDelete(project.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground pl-6">
                    {client && <span>{client.name}</span>}
                    <span>{formatDuration(totalSec)} tracked</span>
                    {earned > 0 && <span>${earned.toFixed(0)} earned</span>}
                    {project.budgetHours && (
                      <span>{totalHrs.toFixed(1)} / {project.budgetHours}h budget</span>
                    )}
                  </div>

                  {budgetPct !== null && (
                    <div className="pl-6">
                      <div className="h-1.5 w-full rounded-full bg-muted">
                        <div
                          className="h-1.5 rounded-full transition-all"
                          style={{
                            width: `${budgetPct}%`,
                            backgroundColor: budgetPct >= 90 ? "#ef4444" : project.color,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {project.notes && (
                    <p className="text-xs text-muted-foreground pl-6">{project.notes}</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={showForm} onClose={resetForm} title={editId ? "Edit Project" : "New Project"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input placeholder="e.g. Website Redesign" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Color</label>
            <div className="flex gap-2 flex-wrap">
              {PROJECT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="h-7 w-7 rounded-full border-2 transition-all"
                  style={{
                    backgroundColor: c,
                    borderColor: color === c ? "#18181b" : "transparent",
                    transform: color === c ? "scale(1.15)" : "scale(1)",
                  }}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Client</label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="flex h-9 w-full rounded-lg border border-input bg-white px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">No client</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                className="flex h-9 w-full rounded-lg border border-input bg-white px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Hourly Rate ($)</label>
              <Input type="number" placeholder="0" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Budget (hours)</label>
              <Input type="number" placeholder="0" value={budgetHours} onChange={(e) => setBudgetHours(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Project notes..."
              rows={2}
              className="flex w-full rounded-lg border border-input bg-white px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={resetForm}>Cancel</Button>
            <Button type="submit">{editId ? "Save" : "Create"}</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
