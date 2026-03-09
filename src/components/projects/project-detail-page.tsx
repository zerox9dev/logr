import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Clock, DollarSign, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAppData } from "@/lib/data-context";
import { t } from "@/lib/i18n";
import sh from "@/components/shared.module.css";
import s from "./project-detail-page.module.css";

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m`;
  return "0m";
}

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { projects, sessions, clients, getClientById } = useAppData();

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

  const paidSeconds = useMemo(() =>
    projectSessions.filter((se) => se.payment_status === "paid").reduce((sum, se) => sum + se.duration_seconds, 0),
    [projectSessions]
  );

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
            {client?.name || "—"} · <Badge variant="secondary">{project.status}</Badge> · {project.billing_type === "hourly" ? `$${project.rate}/hr` : `$${project.fixed_budget} fixed`}
          </p>
        </div>
        <Link to="/app/timer">
          <Button>{t("dash.startTimer")}</Button>
        </Link>
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
                </tr>
              );
            })}
          </tbody>
        </table>
        {projectSessions.length === 0 && (
          <p className={sh.emptyText}>{t("dash.noEntries")}</p>
        )}
      </div>
    </div>
  );
}
