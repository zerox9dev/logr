import { useState, useEffect, useRef } from "react";
import { Play, Square, Plus, Trash2, Pencil, Check, CircleDollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { useAppData } from "@/lib/data-context";
import { t } from "@/lib/i18n";
import type { Session } from "@/types/database";

function formatTimer(seconds: number): string {
  const h = Math.floor(seconds / 3600); const m = Math.floor((seconds % 3600) / 60); const s = seconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
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
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (timerRunning) { intervalRef.current = setInterval(() => setTimerSeconds((s) => s + 1), 1000); }
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
    setFormName(""); setFormDuration(""); setFormProjectId(""); setFormDate(new Date().toISOString().slice(0, 10)); setFormStatus("unpaid");
    setShowManual(true);
  };
  const openEdit = (s: Session) => {
    setEditSession(s);
    setFormName(s.name); setFormDuration(durationToInput(s.duration_seconds));
    setFormProjectId(s.project_id || ""); setFormDate(s.started_at.slice(0, 10)); setFormStatus(s.payment_status);
    setShowManual(true);
  };
  const handleSave = async () => {
    const dur = parseDuration(formDuration); if (!formName || !dur) return;
    const proj = formProjectId ? projects.find((p) => p.id === formProjectId) : null;
    const billing = proj?.billing_type || "hourly";
    const rate = billing === "hourly" ? (proj?.rate ?? Number(settings?.default_rate) ?? 0) : 0;

    if (editSession) {
      await updateSession(editSession.id, { name: formName, project_id: formProjectId || null, client_id: proj?.client_id || null, started_at: new Date(formDate).toISOString(), duration_seconds: dur, rate, billing_type: billing, payment_status: formStatus as any });
    } else {
      await addSession({ name: formName, project_id: formProjectId || null, client_id: proj?.client_id || null, notes: null, started_at: new Date(formDate).toISOString(), duration_seconds: dur, rate, billing_type: billing, payment_status: formStatus as any });
    }
    setShowManual(false); setEditSession(null);
  };

  const grouped = new Map<string, typeof sessions>();
  sessions.forEach((s) => { const key = s.started_at.slice(0, 10); const arr = grouped.get(key) || []; arr.push(s); grouped.set(key, arr); });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">{t("timer.title")}</h1><p className="text-sm text-muted-foreground mt-1">{t("timer.desc")}</p></div>
        <Button variant="outline" onClick={openCreate}><Plus className="h-4 w-4" /> {t("timer.manualEntry")}</Button>
      </div>

      <Card><CardContent className="p-6">
        <div className="flex items-center gap-4">
          <Input value={timerDescription} onChange={(e) => setTimerDescription(e.target.value)} placeholder={t("timer.whatWorking")} className="flex-1 text-lg h-12" />
          <select value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)} className="h-12 rounded-lg border border-input bg-white px-3 text-sm">
            <option value="">{t("timer.noProject")}</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <div className="text-2xl font-mono font-bold min-w-[120px] text-center">{formatTimer(timerSeconds)}</div>
          <Button size="lg" onClick={handleToggle} className={timerRunning ? "bg-red-500 hover:bg-red-600" : "bg-emerald-500 hover:bg-emerald-600"}>
            {timerRunning ? <Square className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">{t("timer.spaceStart")}</p>
      </CardContent></Card>

      {Array.from(grouped.entries()).map(([date, entries]) => {
        const dayTotal = entries.reduce((s, e) => s + e.duration_seconds, 0);
        const isToday = date === new Date().toISOString().slice(0, 10);
        return (
          <div key={date}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">{isToday ? t("dash.today") : new Date(date + "T00:00:00").toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" })}</h3>
              <span className="text-xs text-muted-foreground font-mono">{formatShort(dayTotal)}</span>
            </div>
            <div className="rounded-xl border bg-white overflow-hidden">
              <table className="w-full text-sm">
                <tbody>
                  {entries.map((session) => {
                    const project = getProjectById(session.project_id);
                    return (
                      <tr key={session.id} className="group border-b last:border-b-0 hover:bg-accent/40 transition-colors">
                        <td className="py-2.5 px-4 font-medium">{session.name}</td>
                        <td className="py-2.5 px-3 text-muted-foreground">{project?.name || <span className="text-muted-foreground/50">—</span>}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-muted-foreground w-20">{formatShort(session.duration_seconds)}</td>
                        <td className="py-2.5 px-2 w-24">
                          <button onClick={() => updateSession(session.id, { payment_status: session.payment_status === "paid" ? "unpaid" : "paid" } as any)}
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium transition-colors cursor-pointer ${session.payment_status === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                            {session.payment_status === "paid" ? <><Check className="h-3 w-3" /> Paid</> : <><CircleDollarSign className="h-3 w-3" /> Unpaid</>}
                          </button>
                        </td>
                        <td className="py-2.5 px-3 text-right w-20">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(session)}><Pencil className="h-3 w-3" /></Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteSession(session.id)}><Trash2 className="h-3 w-3" /></Button>
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
      {sessions.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">{t("timer.noEntries")}</p>}

      <Dialog open={showManual} onClose={() => { setShowManual(false); setEditSession(null); }} title={editSession ? t("common.edit") : t("timer.manualEntry")}>
        <div className="space-y-4">
          <div className="space-y-2"><label className="text-sm font-medium">{t("timer.description")}</label><Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder={t("timer.whatDidWork")} autoFocus /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><label className="text-sm font-medium">{t("timer.duration")}</label><Input value={formDuration} onChange={(e) => setFormDuration(e.target.value)} placeholder="1h 30m, 1:30, 90m" /></div>
            <div className="space-y-2"><label className="text-sm font-medium">{t("timer.date")}</label><Input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><label className="text-sm font-medium">{t("timer.project")}</label>
              <select value={formProjectId} onChange={(e) => setFormProjectId(e.target.value)} className="flex h-9 w-full rounded-lg border border-input bg-white px-3 py-1 text-sm">
                <option value="">{t("timer.noProject")}</option>{projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select></div>
            <div className="space-y-2"><label className="text-sm font-medium">Status</label>
              <select value={formStatus} onChange={(e) => setFormStatus(e.target.value)} className="flex h-9 w-full rounded-lg border border-input bg-white px-3 py-1 text-sm">
                <option value="unpaid">Unpaid</option><option value="paid">Paid</option>
              </select></div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => { setShowManual(false); setEditSession(null); }}>{t("common.cancel")}</Button>
            <Button onClick={handleSave}>{editSession ? t("common.save") : t("timer.addEntry")}</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
