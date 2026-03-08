import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAppData } from "@/lib/data-context";
import type { ProjectStatus, BillingType } from "@/types/database";
import { t } from "@/lib/i18n";
import sh from "@/components/shared.module.css";
import s from "./projects-page.module.css";

export function ProjectsPage() {
  const { projects, clients, sessions, addProject, updateProject, deleteProject, getClientById } = useAppData();
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | ProjectStatus>("all");

  const filtered = filter === "all" ? projects : projects.filter((p) => p.status === filter);

  return (
    <div className={sh.page}>
      <div className={sh.header}>
        <div>
          <h1 className={sh.title}>{t("projects.title")}</h1>
          <p className={sh.subtitle}>{projects.length} {t("projects.title").toLowerCase()}</p>
        </div>
        <Button onClick={() => setShowCreate(true)}><Plus style={{ width: 16, height: 16 }} /> {t("projects.new")}</Button>
      </div>

      <div className={sh.filterBar}>
        {(["all", "active", "paused", "completed", "cancelled"] as const).map((st) => (
          <Button key={st} variant={filter === st ? "default" : "ghost"} size="sm"
            onClick={() => setFilter(st)} style={{ textTransform: "capitalize" }}>{st}</Button>
        ))}
      </div>

      <div className={s.tableWrap}>
        <table className={s.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Client</th>
              <th>Status</th>
              <th>Billing</th>
              <th>Rate</th>
              <th>Hours</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((project) => {
              const client = getClientById(project.client_id);
              const totalSeconds = sessions.filter((se) => se.project_id === project.id).reduce((sum, se) => sum + se.duration_seconds, 0);
              const hours = Math.round(totalSeconds / 3600 * 10) / 10;

              return (
                <tr key={project.id}>
                  <td className={s.nameCell}>{project.name}</td>
                  <td className={s.mutedCell}>{client?.name || "—"}</td>
                  <td><Badge variant="secondary">{project.status}</Badge></td>
                  <td className={s.mutedCell}>{project.billing_type}</td>
                  <td className={s.mutedCell}>{project.rate ? `$${project.rate}/hr` : "—"}</td>
                  <td className={s.mutedCell}>{hours}h</td>
                  <td className={s.actionsCell}>
                    <button className={s.actionBtn} onClick={() => setEditingId(project.id)}><Pencil style={{ width: 14, height: 14 }} /></button>
                    <button className={s.actionBtn} onClick={() => deleteProject(project.id)}><Trash2 style={{ width: 14, height: 14 }} /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <p className={sh.emptyText}>{t("projects.noProjects")}</p>}
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
      <form onSubmit={handleSubmit} className={sh.formGrid}>
        <div className={sh.formField}>
          <label className={sh.formLabel}>Name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Project name" autoFocus />
        </div>
        <div className={sh.formField}>
          <label className={sh.formLabel}>Client</label>
          <select value={clientId} onChange={(e) => setClientId(e.target.value)} className={sh.formSelect}>
            <option value="">Select client</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className={sh.formRow2}>
          <div className={sh.formField}>
            <label className={sh.formLabel}>Billing</label>
            <select value={billingType} onChange={(e) => setBillingType(e.target.value as BillingType)} className={sh.formSelect}>
              <option value="hourly">Hourly</option>
              <option value="fixed">Fixed</option>
            </select>
          </div>
          <div className={sh.formField}>
            <label className={sh.formLabel}>{billingType === "hourly" ? "Rate ($/hr)" : "Fixed Budget ($)"}</label>
            <Input type="number" value={billingType === "hourly" ? rate : fixedBudget}
              onChange={(e) => billingType === "hourly" ? setRate(e.target.value) : setFixedBudget(e.target.value)}
              placeholder="0" />
          </div>
        </div>
        <div className={sh.formField}>
          <label className={sh.formLabel}>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as ProjectStatus)} className={sh.formSelect}>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div className={sh.formActions}>
          <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit">{initial ? "Save" : "Create"}</Button>
        </div>
      </form>
    </Dialog>
  );
}
