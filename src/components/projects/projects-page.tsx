import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { Project, Client } from "@/types";

interface ProjectsPageProps {
  projects: Project[];
  clients: Client[];
  onAdd: (data: { name: string; clientId: string | null; hourlyRate: number | null }) => void;
  onUpdate: (id: string, data: Partial<Project>) => void;
  onDelete: (id: string) => void;
  getClientById: (id: string | null) => Client | undefined;
}

export function ProjectsPage({ projects, clients, onAdd, onUpdate, onDelete, getClientById }: ProjectsPageProps) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [clientId, setClientId] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");

  const resetForm = () => {
    setName("");
    setClientId("");
    setHourlyRate("");
    setEditId(null);
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editId) {
      onUpdate(editId, {
        name: name.trim(),
        clientId: clientId || null,
        hourlyRate: hourlyRate ? Number(hourlyRate) : null,
      });
    } else {
      onAdd({
        name: name.trim(),
        clientId: clientId || null,
        hourlyRate: hourlyRate ? Number(hourlyRate) : null,
      });
    }
    resetForm();
  };

  const handleEdit = (project: Project) => {
    setName(project.name);
    setClientId(project.clientId || "");
    setHourlyRate(project.hourlyRate?.toString() || "");
    setEditId(project.id);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {projects.length} project{projects.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" /> New Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No projects yet. Create your first one.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {projects.map((project) => {
            const client = getClientById(project.clientId);
            return (
              <Card key={project.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-3 w-3 rounded-full shrink-0"
                      style={{ backgroundColor: project.color }}
                    />
                    <div>
                      <span className="text-sm font-medium">{project.name}</span>
                      {client && (
                        <span className="text-xs text-muted-foreground ml-2">
                          {client.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {project.hourlyRate && (
                      <Badge variant="secondary">${project.hourlyRate}/hr</Badge>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(project)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(project.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
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
            <Input
              placeholder="e.g. Website Redesign"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Client</label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">No client</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Hourly Rate ($)</label>
            <Input
              type="number"
              placeholder="0"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
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
