import { useState, useEffect, useRef } from "react";
import { Play, Square, Plus, Trash2, Pencil, Check, CircleDollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { useAppData } from "@/lib/data-context";
import { t } from "@/lib/i18n";
import type { Session } from "@/types/database";
import sh from "@/components/shared.module.css";
import s from "./timer-page.module.css";

function formatTimer(seconds: number): string {
  const h = Math.floor(seconds / 3600); const m = Math.floor((seconds % 3600) / 60); const sec = seconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}
function formatShort(seconds: number): string {
  const h = Math.floor(seconds / 3600); const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`; return `${m}m`;
}
function durationToInput(seconds: number): string {
  const h = Math.floor(seconds / 3600); const m = Math.floor((seconds % 3600) / 60);
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}
function parseDuration(input: string): number | null {
  const hm = input.match(/^(\d+)h\s*(\d+)m$/i); if (hm) return Number(hm[1]) * 3600 + Number(hm[2]) * 60;
  const hOnly = input.match(/^(\d+)h$/i); if (hOnly) return Number(hOnly[1]) * 3600;
  const mOnly = input.match(/^(\d+)m$/i); if (mOnly) return Number(mOnly[1]) * 60;
  const colon = input.match(/^(\d+):(\d{2})$/); if (colon) return Number(colon[1]) * 3600 + Number(colon[2]) * 60;
  return null;
}
function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  const today = new Date().toISOString().slice(0, 10);
  if (iso === today) return "Today";
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export function TimerPage() {
  const { sessions, projects, addSession, updateSession, deleteSession, getProjectById, settings,
    timerRunning, setTimerRunning, timerSeconds, setTimerSeconds, timerDescription, setTimerDescription } = useAppData();
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [showManual, setShowManual] = useState(false);
  const [editSession, setEditSession] = useState<Session | null>(null);
  const [formName, setFormName] = useState("");
  const [formDuration, setFormDuration] = useState("");
  const [formProjectId, setFormProjectId] = useState("");
  const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 10));
  const [formStatus, setFormStatus] = useState<string>("unpaid");
  const [formRate, setFormRate] = useState<string>("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (timerRunning) { intervalRef.current = setInterval(() => setTimerSeconds((v: number) => v + 1), 1000); }
    else if (intervalRef.current) clearInterval(intervalRef.current);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [timerRunning, setTimerSeconds]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === "Space") { e.preventDefault(); handleToggle(); }
      if (e.code === "Escape" && timerRunning) handleStop();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [timerRunning, timerSeconds, timerDescription]);

  const handleToggle = () => { if (timerRunning) handleStop(); else setTimerRunning(true); };
  const handleStop = async () => {
    setTimerRunning(false);
    if (timerSeconds > 0) {
      const project = selectedProjectId ? projects.find((p) => p.id === selectedProjectId) : null;
      const billingType = project?.billing_type || "hourly";
      const rate = billingType === "hourly" ? (project?.rate ?? Number(settings?.default_rate) ?? 0) : 0;
      await addSession({ name: timerDescription || t("timer.untitled"), project_id: selectedProjectId || null, client_id: project?.client_id || null, notes: null, started_at: new Date(Date.now() - timerSeconds * 1000).toISOString(), duration_seconds: timerSeconds, rate, billing_type: billingType, payment_status: "unpaid" });
      setTimerSeconds(0); setTimerDescription("");
    }
  };

  const openCreate = () => {
    setEditSession(null);
    setFormName(""); setFormDuration(""); setFormProjectId(""); setFormDate(new Date().toISOString().slice(0, 10)); setFormStatus("unpaid"); setFormRate("");
    setShowManual(true);
  };
  const openEdit = (se: Session) => {
    setEditSession(se);
    setFormName(se.name); setFormDuration(durationToInput(se.duration_seconds));
    setFormProjectId(se.project_id || ""); setFormDate(se.started_at.slice(0, 10)); setFormStatus(se.payment_status); setFormRate(se.rate ? String(se.rate) : "");
    setShowManual(true);
  };
  const handleSave = async () => {
    const dur = parseDuration(formDuration); if (!formName || !dur) return;
    const proj = formProjectId ? projects.find((p) => p.id === formProjectId) : null;
    const billing = proj?.billing_type || "hourly";
    const rate = formRate ? Number(formRate) : (billing === "hourly" ? (proj?.rate ?? Number(settings?.default_rate) ?? 0) : 0);

    if (editSession) {
      await updateSession(editSession.id, { name: formName, project_id: formProjectId || null, client_id: proj?.client_id || null, started_at: new Date(formDate).toISOString(), duration_seconds: dur, rate, billing_type: billing, payment_status: formStatus as any });
    } else {
      await addSession({ name: formName, project_id: formProjectId || null, client_id: proj?.client_id || null, notes: null, started_at: new Date(formDate).toISOString(), duration_seconds: dur, rate, billing_type: billing, payment_status: formStatus as any });
    }
    setShowManual(false); setEditSession(null);
  };

  const sorted = [...sessions].sort((a, b) => b.started_at.localeCompare(a.started_at));

  return (
    <div className={sh.page}>
      <div className={sh.header}>
        <div>
          <h1 className={sh.title}>{t("timer.title")}</h1>
          <p className={sh.subtitle}>{sessions.length} sessions</p>
        </div>
        <Button onClick={openCreate}><Plus style={{ width: 16, height: 16 }} /> {t("timer.manualEntry")}</Button>
      </div>

      <div className={s.timerControl}>
        <div className={s.timerRow}>
          <Input value={timerDescription} onChange={(e) => setTimerDescription(e.target.value)} placeholder={t("timer.whatWorking")} className={s.timerInput} />
          <select value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)} className={s.timerSelect}>
            <option value="">{t("timer.noProject")}</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <div className={s.timerDisplay}>{formatTimer(timerSeconds)}</div>
          <Button size="lg" onClick={handleToggle} className={timerRunning ? s.btnStop : s.btnStart}>
            {timerRunning ? <Square style={{ width: 20, height: 20 }} /> : <Play style={{ width: 20, height: 20 }} />}
          </Button>
        </div>
        <p className={s.timerHint}>{t("timer.spaceStart")}</p>
      </div>

      <div className={s.tableWrap}>
        <table className={s.table}>
          <thead>
            <tr>
              <th>{t("timer.description")}</th>
              <th>{t("timer.project")}</th>
              <th>{t("timer.date")}</th>
              <th>{t("timer.duration")}</th>
              <th>{t("projects.rate")}</th>
              <th>{t("projects.status")}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((session) => {
              const project = getProjectById(session.project_id);
              return (
                <tr key={session.id}>
                  <td className={s.nameCell}>{session.name}</td>
                  <td className={s.mutedCell}>{project?.name || "—"}</td>
                  <td className={s.mutedCell}>{formatDate(session.started_at.slice(0, 10))}</td>
                  <td className={s.durationCell}>{formatShort(session.duration_seconds)}</td>
                  <td className={s.mutedCell}>{session.rate > 0 ? `$${session.rate}/hr` : session.billing_type === "fixed" ? t("projects.fixed") : "—"}</td>
                  <td>
                    <button onClick={() => updateSession(session.id, { payment_status: session.payment_status === "paid" ? "unpaid" : "paid" } as any)}
                      className={[s.statusBadge, session.payment_status === "paid" ? s.statusPaid : s.statusUnpaid].join(" ")}>
                      {session.payment_status === "paid" ? <><Check className={s.statusIcon} /> {t("invoices.paid")}</> : <><CircleDollarSign className={s.statusIcon} /> {t("invoices.unpaid")}</>}
                    </button>
                  </td>
                  <td className={s.actionsCell}>
                    <button className={s.actionBtn} onClick={() => openEdit(session)}><Pencil style={{ width: 14, height: 14 }} /></button>
                    <button className={s.actionBtn} onClick={() => deleteSession(session.id)}><Trash2 style={{ width: 14, height: 14 }} /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {sessions.length === 0 && <p className={sh.emptyText}>{t("timer.noEntries")}</p>}
      </div>

      <Dialog open={showManual} onClose={() => { setShowManual(false); setEditSession(null); }} title={editSession ? t("common.edit") : t("timer.manualEntry")}>
        <div className={s.formGrid}>
          <div className={s.formField}><label className={s.formLabel}>{t("timer.description")}</label><Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder={t("timer.whatDidWork")} autoFocus /></div>
          <div className={s.formRow2}>
            <div className={s.formField}><label className={s.formLabel}>{t("timer.duration")}</label><Input value={formDuration} onChange={(e) => setFormDuration(e.target.value)} placeholder="1h 30m, 1:30, 90m" /></div>
            <div className={s.formField}><label className={s.formLabel}>{t("timer.date")}</label><Input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} /></div>
          </div>
          <div className={s.formField}><label className={s.formLabel}>{t("timer.project")}</label>
            <select value={formProjectId} onChange={(e) => setFormProjectId(e.target.value)} className={s.formSelect}>
              <option value="">{t("timer.noProject")}</option>{projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select></div>
          <div className={s.formRow2}>
            <div className={s.formField}><label className={s.formLabel}>{t("projects.rate")}</label>
              <Input type="number" value={formRate} onChange={(e) => setFormRate(e.target.value)} placeholder="0" /></div>
            <div className={s.formField}><label className={s.formLabel}>{t("projects.status")}</label>
              <select value={formStatus} onChange={(e) => setFormStatus(e.target.value)} className={s.formSelect}>
                <option value="unpaid">{t("invoices.unpaid")}</option><option value="paid">{t("invoices.paid")}</option>
              </select></div>
          </div>
          <div className={s.formActions}>
            <Button variant="outline" onClick={() => { setShowManual(false); setEditSession(null); }}>{t("common.cancel")}</Button>
            <Button onClick={handleSave}>{editSession ? t("common.save") : t("timer.addEntry")}</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
