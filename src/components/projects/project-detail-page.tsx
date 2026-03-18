import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Clock, DollarSign, Calendar, Plus, Pencil, Trash2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAppData } from "@/lib/data-context";
import { t } from "@/lib/i18n";
import type { Session } from "@/types/database";
import sh from "@/components/shared.module.css";
import s from "./project-detail-page.module.css";

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  if (m > 0) return `${m}m`;
  return "0m";
}

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

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { projects, sessions, clients, getClientById, addSession, updateSession, deleteSession } = useAppData();
  const [showAddSession, setShowAddSession] = useState(false);
  const [editSession, setEditSession] = useState<Session | null>(null);

  const project = projects.find((p) => p.id === id);

  const projectSessions = useMemo(() => {
    if (!id) return [];
    return sessions
      .filter((se) => se.project_id === id)
      .sort((a, b) => b.started_at.localeCompare(a.started_at));
  }, [id, sessions]);

  const totalSeconds = useMemo(() =>
    projectSessions.reduce((sum, se) => sum + se.duration_seconds, 0),
    [projectSessions]
  );

  const totalEarned = useMemo(() => {
    if (!project) return 0;
    if (project.billing_type === "hourly" && project.rate) {
      return (totalSeconds / 3600) * project.rate;
    }
    return project.fixed_budget || 0;
  }, [project, totalSeconds]);

  const totalPaidEarned = useMemo(() => {
    if (!project) return 0;
    if (project.billing_type === "hourly" && project.rate) {
      return projectSessions
        .filter((s) => s.payment_status === "paid")
        .reduce((sum, s) => sum + ((s.duration_seconds / 3600) * project.rate!), 0);
    }
    return project.fixed_budget || 0;
  }, [project, projectSessions]);

  if (!project) {
    return (
      <div className={sh.page}>
        <p className={sh.emptyText}>{t("common.noData")}</p>
      </div>
    );
  }

  const client = getClientById(project.client_id);

  return (
    <div className={sh.page}>
      <div className={s.backRow}>
        <Link to="/app/projects">
          <Button variant="ghost" size="sm"><ArrowLeft style={{ width: 16, height: 16 }} /> {t("projects.title")}</Button>
        </Link>
      </div>

      <div className={s.header}>
        <div>
          <h1 className={s.projectName}>{project.name}</h1>
          <p className={s.meta}>
            {client?.name || "—"} · <Badge variant={getStatusBadgeVariant(project.status)}>{capitalizeStatus(project.status)}</Badge> · {project.billing_type === "hourly" ? `$${project.rate}/hr` : `$${project.fixed_budget} fixed`}
          </p>
        </div>
        <div className={s.headerActions}>
          <Button variant="outline" onClick={() => setShowAddSession(true)}>
            <Plus style={{ width: 16, height: 16 }} /> {t("timer.addManual")}
          </Button>
          <Link to="/app/timer">
            <Button>{t("dash.startTimer")}</Button>
          </Link>
        </div>
      </div>

      <div className={s.statsGrid}>
        <Card>
          <CardContent className={s.statCard}>
            <Clock className={s.statIcon} style={{ color: "var(--emerald-500)" }} />
            <div>
              <p className={s.statValue}>{formatDuration(totalSeconds)}</p>
              <p className={s.statLabel}>{t("reports.totalTime")}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className={s.statCard}>
            <DollarSign className={s.statIcon} style={{ color: "var(--blue-500)" }} />
            <div>
              <p className={s.statValue}>${totalEarned.toFixed(0)}</p>
              <p className={s.statLabel}>{t("reports.earnings")}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className={s.statCard}>
            <CheckCircle2 className={s.statIcon} style={{ color: "var(--green-500)" }} />
            <div>
              <p className={s.statValue}>${totalPaidEarned.toFixed(0)}</p>
              <p className={s.statLabel}>{t("invoices.paid")}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className={s.statCard}>
            <Calendar className={s.statIcon} style={{ color: "var(--violet-400)" }} />
            <div>
              <p className={s.statValue}>{projectSessions.length}</p>
              <p className={s.statLabel}>Sessions</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className={s.tableWrap}>
        <table className={s.table}>
          <thead>
            <tr>
              <th>{t("timer.date")}</th>
              <th>{t("timer.description")}</th>
              <th>{t("timer.duration")}</th>
              <th>{t("projects.rate")}</th>
              <th>{t("projects.status")}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {projectSessions.map((session) => {
              const date = new Date(session.started_at);
              const earned = project.billing_type === "hourly" && project.rate
                ? (session.duration_seconds / 3600) * project.rate
                : null;

              return (
                <tr key={session.id}>
                  <td className={s.dateCell}>
                    {date.toLocaleDateString([], { month: "short", day: "numeric" })}
                  </td>
                  <td className={s.nameCell}>{session.name || t("timer.untitled")}</td>
                  <td className={s.monoCell}>{formatDuration(session.duration_seconds)}</td>
                  <td className={s.mutedCell}>{earned !== null ? `$${earned.toFixed(0)}` : "—"}</td>
                  <td>
                    <Badge variant={session.payment_status === "paid" ? "default" : "secondary"}>
                      {session.payment_status === "paid" ? t("invoices.paid") : t("invoices.unpaid")}
                    </Badge>
                  </td>
                  <td className={s.actionsCell}>
                    <button className={s.actionBtn} onClick={() => setEditSession(session)}><Pencil style={{ width: 14, height: 14 }} /></button>
                    <button className={s.actionBtn} onClick={() => { if (confirm(t("common.confirmDelete"))) deleteSession(session.id); }}><Trash2 style={{ width: 14, height: 14 }} /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {projectSessions.length === 0 && (
          <p className={sh.emptyText}>{t("dash.noEntries")}</p>
        )}
      </div>

      {showAddSession && (
        <AddSessionDialog
          open={showAddSession}
          onClose={() => setShowAddSession(false)}
          project={project}
          onSubmit={async (data) => {
            await addSession(data);
            setShowAddSession(false);
          }}
        />
      )}

      {editSession && (
        <EditSessionDialog
          open={!!editSession}
          onClose={() => setEditSession(null)}
          session={editSession}
          project={project}
          onSave={async (data) => {
            await updateSession(editSession.id, data);
            setEditSession(null);
          }}
          onDelete={async () => {
            if (confirm(t("common.confirmDelete"))) {
              await deleteSession(editSession.id);
              setEditSession(null);
            }
          }}
        />
      )}
    </div>
  );
}

function AddSessionDialog({ open, onClose, project, onSubmit }: {
  open: boolean;
  onClose: () => void;
  project: { id: string; client_id: string; rate: number | null; billing_type: string };
  onSubmit: (data: any) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [status, setStatus] = useState<"unpaid" | "paid">("unpaid");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const h = parseInt(hours) || 0;
    const m = parseInt(minutes) || 0;
    const totalSec = h * 3600 + m * 60;
    if (totalSec === 0) return;

    onSubmit({
      name: name || t("timer.untitled"),
      project_id: project.id,
      client_id: project.client_id || null,
      started_at: `${date}T12:00:00.000Z`,
      duration_seconds: totalSec,
      rate: project.rate || 0,
      billing_type: project.billing_type || "hourly",
      payment_status: status,
      notes: null,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} title={t("timer.addManual")}>
      <form onSubmit={handleSubmit} className={sh.formGrid}>
        <div className={sh.formField}>
          <label className={sh.formLabel}>{t("timer.description")}</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("timer.whatWorkedOn")} autoFocus />
        </div>
        <div className={sh.formField}>
          <label className={sh.formLabel}>{t("timer.date")}</label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className={sh.formRow2}>
          <div className={sh.formField}>
            <label className={sh.formLabel}>{t("timer.hours")}</label>
            <Input type="number" min="0" value={hours} onChange={(e) => setHours(e.target.value)} placeholder="0" />
          </div>
          <div className={sh.formField}>
            <label className={sh.formLabel}>{t("timer.minutes")}</label>
            <Input type="number" min="0" max="59" value={minutes} onChange={(e) => setMinutes(e.target.value)} placeholder="0" />
          </div>
        </div>
        <div className={sh.formField}>
          <label className={sh.formLabel}>{t("projects.status")}</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as "unpaid" | "paid")} className={sh.formSelect}>
            <option value="unpaid">{t("invoices.unpaid")}</option>
            <option value="paid">{t("invoices.paid")}</option>
          </select>
        </div>
        <div className={sh.formActions}>
          <Button variant="outline" type="button" onClick={onClose}>{t("common.cancel")}</Button>
          <Button type="submit">{t("common.create")}</Button>
        </div>
      </form>
    </Dialog>
  );
}

function EditSessionDialog({ open, onClose, session, project, onSave, onDelete }: {
  open: boolean;
  onClose: () => void;
  session: Session;
  project: { id: string; client_id: string; rate: number | null; billing_type: string };
  onSave: (data: any) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const [name, setName] = useState(session.name || "");
  const [date, setDate] = useState(session.started_at.slice(0, 10));
  const [hours, setHours] = useState(String(Math.floor(session.duration_seconds / 3600)));
  const [minutes, setMinutes] = useState(String(Math.floor((session.duration_seconds % 3600) / 60)));
  const [rate, setRate] = useState(session.rate ? String(session.rate) : "");
  const [status, setStatus] = useState<"unpaid" | "paid">(session.payment_status as "unpaid" | "paid");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const h = parseInt(hours) || 0;
    const m = parseInt(minutes) || 0;
    const totalSec = h * 3600 + m * 60;
    if (totalSec === 0) return;

    onSave({
      name: name || t("timer.untitled"),
      project_id: project.id,
      client_id: project.client_id || null,
      started_at: `${date}T12:00:00.000Z`,
      duration_seconds: totalSec,
      rate: rate ? Number(rate) : (project.rate || 0),
      billing_type: project.billing_type || "hourly",
      payment_status: status,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} title={t("common.edit")}>
      <form onSubmit={handleSubmit} className={sh.formGrid}>
        <div className={sh.formField}>
          <label className={sh.formLabel}>{t("timer.description")}</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("timer.whatWorkedOn")} autoFocus />
        </div>
        <div className={sh.formField}>
          <label className={sh.formLabel}>{t("timer.date")}</label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className={sh.formRow2}>
          <div className={sh.formField}>
            <label className={sh.formLabel}>{t("timer.hours")}</label>
            <Input type="number" min="0" value={hours} onChange={(e) => setHours(e.target.value)} placeholder="0" />
          </div>
          <div className={sh.formField}>
            <label className={sh.formLabel}>{t("timer.minutes")}</label>
            <Input type="number" min="0" max="59" value={minutes} onChange={(e) => setMinutes(e.target.value)} placeholder="0" />
          </div>
        </div>
        <div className={sh.formRow2}>
          <div className={sh.formField}>
            <label className={sh.formLabel}>{t("projects.rate")}</label>
            <Input type="number" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="0" />
          </div>
          <div className={sh.formField}>
            <label className={sh.formLabel}>{t("projects.status")}</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as "unpaid" | "paid")} className={sh.formSelect}>
              <option value="unpaid">{t("invoices.unpaid")}</option>
              <option value="paid">{t("invoices.paid")}</option>
            </select>
          </div>
        </div>
        <div className={sh.formActions}>
          <Button variant="destructive" type="button" onClick={onDelete}>{t("common.delete")}</Button>
          <div style={{ flex: 1 }} />
          <Button variant="outline" type="button" onClick={onClose}>{t("common.cancel")}</Button>
          <Button type="submit">{t("common.save")}</Button>
        </div>
      </form>
    </Dialog>
  );
}
