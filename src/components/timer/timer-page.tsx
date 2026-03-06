import { useState, useEffect, useRef } from "react";
import { Play, Square, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { useAppData } from "@/lib/data-context";
import { t } from "@/lib/i18n";

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600); const m = Math.floor((seconds % 3600) / 60); const s = seconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
function formatShort(seconds: number): string {
  const h = Math.floor(seconds / 3600); const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`; return `${m}m`;
}
function parseDuration(input: string): number | null {
  const hm = input.match(/^(\d+)h\s*(\d+)m$/i); if (hm) return Number(hm[1]) * 3600 + Number(hm[2]) * 60;
  const hOnly = input.match(/^(\d+)h$/i); if (hOnly) return Number(hOnly[1]) * 3600;
  const mOnly = input.match(/^(\d+)m$/i); if (mOnly) return Number(mOnly[1]) * 60;
  const colon = input.match(/^(\d+):(\d{2})$/); if (colon) return Number(colon[1]) * 3600 + Number(colon[2]) * 60;
  return null;
}

export function TimerPage() {
  const { sessions, projects, addSession, deleteSession, getProjectById, settings,
    timerRunning, setTimerRunning, timerSeconds, setTimerSeconds, timerDescription, setTimerDescription } = useAppData();
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [showManual, setShowManual] = useState(false);
  const [manualName, setManualName] = useState("");
  const [manualDuration, setManualDuration] = useState("");
  const [manualProjectId, setManualProjectId] = useState("");
  const [manualDate, setManualDate] = useState(new Date().toISOString().slice(0, 10));
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
      const rate = project?.rate ?? Number(settings?.default_rate) ?? 0;
      const billingType = project?.billing_type || "hourly";
      await addSession({ name: timerDescription || t("timer.untitled"), project_id: selectedProjectId || null, client_id: project?.client_id || null, notes: null, started_at: new Date(Date.now() - timerSeconds * 1000).toISOString(), duration_seconds: timerSeconds, rate, billing_type: billingType, payment_status: "unpaid" });
      setTimerSeconds(0); setTimerDescription("");
    }
  };
  const handleManualAdd = async () => {
    const dur = parseDuration(manualDuration); if (!manualName || !dur) return;
    const mProject = manualProjectId ? projects.find((p) => p.id === manualProjectId) : null;
    const mRate = mProject?.rate ?? Number(settings?.default_rate) ?? 0;
    const mBilling = mProject?.billing_type || "hourly";
    await addSession({ name: manualName, project_id: manualProjectId || null, client_id: mProject?.client_id || null, notes: null, started_at: new Date(manualDate).toISOString(), duration_seconds: dur, rate: mRate, billing_type: mBilling, payment_status: "unpaid" });
    setShowManual(false); setManualName(""); setManualDuration("");
  };

  const grouped = new Map<string, typeof sessions>();
  sessions.forEach((s) => { const key = s.started_at.slice(0, 10); const arr = grouped.get(key) || []; arr.push(s); grouped.set(key, arr); });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">{t("timer.title")}</h1><p className="text-sm text-muted-foreground mt-1">{t("timer.desc")}</p></div>
        <Button variant="outline" onClick={() => setShowManual(true)}><Plus className="h-4 w-4" /> {t("timer.manualEntry")}</Button>
      </div>
      <Card><CardContent className="p-6">
        <div className="flex items-center gap-4">
          <Input value={timerDescription} onChange={(e) => setTimerDescription(e.target.value)} placeholder={t("timer.whatWorking")} className="flex-1 text-lg h-12" />
          <select value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)} className="h-12 rounded-lg border border-input bg-white px-3 text-sm">
            <option value="">{t("timer.noProject")}</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <div className="text-2xl font-mono font-bold min-w-[120px] text-center">{formatDuration(timerSeconds)}</div>
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
              <span className="text-xs text-muted-foreground">{formatShort(dayTotal)}</span>
            </div>
            <div className="space-y-1">
              {entries.map((session) => { const project = getProjectById(session.project_id); return (
                <Card key={session.id} className="group"><CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3"><div><p className="text-sm font-medium">{session.name}</p><p className="text-xs text-muted-foreground">{project?.name || t("timer.noProject")}</p></div></div>
                  <div className="flex items-center gap-2"><span className="text-sm font-mono">{formatShort(session.duration_seconds)}</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100" onClick={() => deleteSession(session.id)}><Trash2 className="h-3 w-3" /></Button></div>
                </CardContent></Card>
              ); })}
            </div>
          </div>
        );
      })}
      {sessions.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">{t("timer.noEntries")}</p>}

      <Dialog open={showManual} onClose={() => setShowManual(false)} title={t("timer.manualEntry")}>
        <div className="space-y-4">
          <div className="space-y-2"><label className="text-sm font-medium">{t("timer.description")}</label><Input value={manualName} onChange={(e) => setManualName(e.target.value)} placeholder={t("timer.whatDidWork")} autoFocus /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><label className="text-sm font-medium">{t("timer.duration")}</label><Input value={manualDuration} onChange={(e) => setManualDuration(e.target.value)} placeholder="1h 30m, 1:30, 90m" /></div>
            <div className="space-y-2"><label className="text-sm font-medium">{t("timer.date")}</label><Input type="date" value={manualDate} onChange={(e) => setManualDate(e.target.value)} /></div>
          </div>
          <div className="space-y-2"><label className="text-sm font-medium">{t("timer.project")}</label>
            <select value={manualProjectId} onChange={(e) => setManualProjectId(e.target.value)} className="flex h-9 w-full rounded-lg border border-input bg-white px-3 py-1 text-sm">
              <option value="">{t("timer.noProject")}</option>{projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select></div>
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setShowManual(false)}>{t("common.cancel")}</Button><Button onClick={handleManualAdd}>{t("timer.addEntry")}</Button></div>
        </div>
      </Dialog>
    </div>
  );
}
