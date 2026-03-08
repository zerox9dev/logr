import { useState, useEffect, useRef } from "react";
import { Play, Square, Plus, Trash2, Pencil, Check, CircleDollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { useAppData } from "@/lib/data-context";
import { t } from "@/lib/i18n";
import type { Session } from "@/types/database";
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

  const grouped = new Map<string, typeof sessions>();
  sessions.forEach((se) => { const key = se.started_at.slice(0, 10); const arr = grouped.get(key) || []; arr.push(se); grouped.set(key, arr); });

  return (
    <div className={s.page}>
      <div className={s.header}>
        <div><h1 className={s.title}>{t("timer.title")}</h1><p className={s.desc}>{t("timer.desc")}</p></div>
        <Button variant="outline" onClick={openCreate}><Plus style={{ width: 16, height: 16 }} /> {t("timer.manualEntry")}</Button>
      </div>

      <Card><CardContent className={s.timerCard}>
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
      </CardContent></Card>

      {Array.from(grouped.entries()).map(([date, entries]) => {
        const dayTotal = entries.reduce((sum, e) => sum + e.duration_seconds, 0);
        const isToday = date === new Date().toISOString().slice(0, 10);
        return (
          <div key={date}>
            <div className={s.dayHeader}>
              <h3 className={s.dayTitle}>{isToday ? t("dash.today") : new Date(date + "T00:00:00").toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" })}</h3>
              <span className={s.dayTotal}>{formatShort(dayTotal)}</span>
            </div>
            <div className={s.dayTable}>
              <table className={s.dayTableInner}>
                <tbody>
                  {entries.map((session) => {
                    const project = getProjectById(session.project_id);
                    return (
                      <tr key={session.id} className={s.sessionRow}>
                        <td className={s.cellName}>{session.name}</td>
                        <td className={s.cellProject}>{project?.name || <span className={s.cellProjectEmpty}>—</span>}</td>
                        <td className={s.cellDuration}>{formatShort(session.duration_seconds)}</td>
                        <td className={s.cellRate}>
                          {session.rate > 0 ? `$${session.rate}/hr` : session.billing_type === "fixed" ? "Fixed" : <span className={s.cellRateEmpty}>—</span>}
                        </td>
                        <td className={s.cellStatus}>
                          <button onClick={() => updateSession(session.id, { payment_status: session.payment_status === "paid" ? "unpaid" : "paid" } as any)}
                            className={[s.statusBadge, session.payment_status === "paid" ? s.statusPaid : s.statusUnpaid].join(" ")}>
                            {session.payment_status === "paid" ? <><Check className={s.statusIcon} /> Paid</> : <><CircleDollarSign className={s.statusIcon} /> Unpaid</>}
                          </button>
                        </td>
                        <td className={s.cellActions}>
                          <div className={s.actions}>
                            <Button variant="ghost" size="icon" className={s.actionBtn} onClick={() => openEdit(session)}><Pencil style={{ width: 12, height: 12 }} /></Button>
                            <Button variant="ghost" size="icon" className={[s.actionBtn, s.actionBtnDelete].join(" ")} onClick={() => deleteSession(session.id)}><Trash2 style={{ width: 12, height: 12 }} /></Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
      {sessions.length === 0 && <p className={s.emptyText}>{t("timer.noEntries")}</p>}

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
            <div className={s.formField}><label className={s.formLabel}>Status</label>
              <select value={formStatus} onChange={(e) => setFormStatus(e.target.value)} className={s.formSelect}>
                <option value="unpaid">Unpaid</option><option value="paid">Paid</option>
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
