import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2 } from "lucide-react";

function capitalizeStatus(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function getStatusBadgeVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "active":
      return "default";
    case "completed":
      return "outline";
    case "cancelled":
      return "destructive";
    case "paused":
    default:
      return "secondary";
  }
}
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
  const { projects, clients, sessions, settings, addProject, updateProject, deleteProject, getClientById } = useAppData();
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | ProjectStatus>("all");
  const navigate = useNavigate();
  const currencySymbol = { USD: "$", EUR: "€", GBP: "£", UAH: "₴", PLN: "zł" }[settings?.default_currency || "USD"] || "$";

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
              <th>{t("projects.name")}</th>
              <th>{t("projects.client")}</th>
              <th>{t("projects.status")}</th>
              <th>{t("projects.billing")}</th>
              <th>{t("projects.rate")}</th>
              <th>{t("reports.totalTime")}</th>
              <th>{t("reports.earnings")}</th>
              <th>{t("invoices.paid")}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((project) => {
              const client = getClientById(project.client_id);
              const projectSessions = sessions.filter((se) => se.project_id === project.id);
              const totalSeconds = projectSessions.reduce((sum, se) => sum + se.duration_seconds, 0);
              const hours = Math.round(totalSeconds / 3600 * 10) / 10;
              const earned = project.billing_type === "hourly"
                ? (totalSeconds / 3600) * (project.rate || 0)
                : (project.fixed_budget || 0);
              const paidEarned = project.billing_type === "hourly"
                ? projectSessions
                    .filter((s) => s.payment_status === "paid")
                    .reduce((sum, s) => sum + ((s.duration_seconds / 3600) * (project.rate || 0)), 0)
                : (project.fixed_budget || 0);

              return (
                <tr key={project.id} onClick={() => navigate(`/app/projects/${project.id}`)} style={{ cursor: "pointer" }}>
                  <td className={s.nameCell}>{project.name}</td>
                  <td className={s.mutedCell}>{client?.name || "—"}</td>
                  <td><Badge variant={getStatusBadgeVariant(project.status)}>{capitalizeStatus(project.status)}</Badge></td>
                  <td className={s.mutedCell}>{project.billing_type}</td>
                  <td className={s.mutedCell}>{project.rate ? `$${project.rate}/hr` : "—"}</td>
                  <td className={s.mutedCell}>{hours}h</td>
                  <td className={s.mutedCell}>{currencySymbol}{earned.toFixed(0)}</td>
                  <td className={s.mutedCell}>{currencySymbol}{paidEarned.toFixed(0)}</td>
                  <td className={s.actionsCell}>
                    <button className={s.actionBtn} onClick={(e) => { e.stopPropagation(); setEditingId(project.id); }}><Pencil style={{ width: 14, height: 14 }} /></button>
                    <button className={s.actionBtn} onClick={(e) => { e.stopPropagation(); deleteProject(project.id); }}><Trash2 style={{ width: 14, height: 14 }} /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <p className={sh.emptyText}>{t("projects.noProjects")}</p>}
      </div>

      <ProjectDialog
        open={showCreate} onClose={() => setShowCreate(false)} title={t("projects.new")}
        clients={clients}
        onSubmit={async (data) => { await addProject(data); setShowCreate(false); }}
      />

      {editingId && (() => {
        const p = projects.find((pr) => pr.id === editingId);
        if (!p) return null;
        return (
          <ProjectDialog
            open={true} onClose={() => setEditingId(null)} title={t("projects.edit")}
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
          <label className={sh.formLabel}>{t("projects.name")}</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Project name" autoFocus />
        </div>
        <div className={sh.formField}>
          <label className={sh.formLabel}>{t("projects.client")}</label>
          <select value={clientId} onChange={(e) => setClientId(e.target.value)} className={sh.formSelect}>
            <option value="">{t("projects.selectClient")}</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className={sh.formRow2}>
          <div className={sh.formField}>
            <label className={sh.formLabel}>{t("projects.billing")}</label>
            <select value={billingType} onChange={(e) => setBillingType(e.target.value as BillingType)} className={sh.formSelect}>
              <option value="hourly">{t("projects.hourly")}</option>
              <option value="fixed">{t("projects.fixed")}</option>
            </select>
          </div>
          <div className={sh.formField}>
            <label className={sh.formLabel}>{billingType === "hourly" ? t("projects.rate") : t("projects.fixedBudget")}</label>
            <Input type="number" value={billingType === "hourly" ? rate : fixedBudget}
              onChange={(e) => billingType === "hourly" ? setRate(e.target.value) : setFixedBudget(e.target.value)}
              placeholder="0" />
          </div>
        </div>
        <div className={sh.formField}>
          <label className={sh.formLabel}>{t("projects.status")}</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as ProjectStatus)} className={sh.formSelect}>
            <option value="active">{t("projects.active")}</option>
            <option value="paused">{t("projects.paused")}</option>
            <option value="completed">{t("projects.completed")}</option>
            <option value="cancelled">{t("projects.cancelled")}</option>
          </select>
        </div>
        <div className={sh.formActions}>
          <Button variant="outline" type="button" onClick={onClose}>{t("common.cancel")}</Button>
          <Button type="submit">{initial ? t("common.save") : t("common.create")}</Button>
        </div>
      </form>
    </Dialog>
  );
}
