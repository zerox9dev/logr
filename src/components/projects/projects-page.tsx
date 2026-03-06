import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAppData } from "@/lib/data-context";
import type { ProjectStatus, BillingType } from "@/types/database";

export function ProjectsPage() {
  const { projects, clients, sessions, addProject, updateProject, deleteProject, getClientById } = useAppData();
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | ProjectStatus>("all");

  const filtered = filter === "all" ? projects : projects.filter((p) => p.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-sm text-muted-foreground mt-1">{projects.length} project{projects.length !== 1 ? "s" : ""}</p>
        </div>
        <Button onClick={() => setShowCreate(true)}><Plus className="h-4 w-4" /> New Project</Button>
      </div>

      <div className="flex gap-1">
        {(["all", "active", "paused", "completed", "cancelled"] as const).map((s) => (
          <Button key={s} variant={filter === s ? "default" : "ghost"} size="sm"
            onClick={() => setFilter(s)} className="capitalize">{s}</Button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((project) => {
          const client = getClientById(project.client_id);
          const totalSeconds = sessions.filter((s) => s.project_id === project.id).reduce((sum, s) => sum + s.duration_seconds, 0);
          const hours = Math.round(totalSeconds / 3600 * 10) / 10;

          return (
            <Card key={project.id} className="group">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{project.name}</p>
                    <Badge variant="secondary" className="text-[10px] capitalize">{project.status}</Badge>
                    <Badge variant="outline" className="text-[10px]">{project.billing_type}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {client?.name || "No client"} · {hours}h tracked
                    {project.rate && ` · $${project.rate}/hr`}
                  </p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingId(project.id)}><Pencil className="h-3 w-3" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteProject(project.id)}><Trash2 className="h-3 w-3" /></Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filtered.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No projects yet.</p>}
      </div>

      <ProjectDialog
        open={showCreate} onClose={() => setShowCreate(false)} title="New Project"
        clients={clients}
        onSubmit={async (data) => { await addProject(data); setShowCreate(false); }}
      />

      {editingId && (() => {
        const p = projects.find((pr) => pr.id === editingId);
        if (!p) return null;
        return (
          <ProjectDialog
            open={true} onClose={() => setEditingId(null)} title="Edit Project"
            clients={clients}
            initial={{ name: p.name, client_id: p.client_id, billing_type: p.billing_type, rate: p.rate, fixed_budget: p.fixed_budget, status: p.status }}
            onSubmit={async (data) => { await updateProject(editingId, data); setEditingId(null); }}
          />
        );
      })()}
    </div>
  );
}

function ProjectDialog({ open, onClose, title, clients, initial, onSubmit }: {
  open: boolean; onClose: () => void; title: string;
  clients: { id: string; name: string }[];
  initial?: { name: string; client_id: string; billing_type: BillingType; rate: number | null; fixed_budget: number | null; status: ProjectStatus };
  onSubmit: (data: any) => Promise<void>;
}) {
  const [name, setName] = useState(initial?.name || "");
  const [clientId, setClientId] = useState(initial?.client_id || "");
  const [billingType, setBillingType] = useState<BillingType>(initial?.billing_type || "hourly");
  const [rate, setRate] = useState(initial?.rate?.toString() || "");
  const [fixedBudget, setFixedBudget] = useState(initial?.fixed_budget?.toString() || "");
  const [status, setStatus] = useState<ProjectStatus>(initial?.status || "active");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !clientId) return;
    onSubmit({
      name, client_id: clientId, billing_type: billingType,
      rate: rate ? Number(rate) : null,
      fixed_budget: fixedBudget ? Number(fixedBudget) : null,
      status,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Project name" autoFocus />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Client</label>
          <select value={clientId} onChange={(e) => setClientId(e.target.value)}
            className="flex h-9 w-full rounded-lg border border-input bg-white px-3 py-1 text-sm">
            <option value="">Select client</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">Billing</label>
            <select value={billingType} onChange={(e) => setBillingType(e.target.value as BillingType)}
              className="flex h-9 w-full rounded-lg border border-input bg-white px-3 py-1 text-sm">
              <option value="hourly">Hourly</option>
              <option value="fixed">Fixed</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{billingType === "hourly" ? "Rate ($/hr)" : "Fixed Budget ($)"}</label>
            <Input type="number" value={billingType === "hourly" ? rate : fixedBudget}
              onChange={(e) => billingType === "hourly" ? setRate(e.target.value) : setFixedBudget(e.target.value)}
              placeholder="0" />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as ProjectStatus)}
            className="flex h-9 w-full rounded-lg border border-input bg-white px-3 py-1 text-sm">
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit">{initial ? "Save" : "Create"}</Button>
        </div>
      </form>
    </Dialog>
  );
}
