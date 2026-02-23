"use client";

import { useEffect, useRef, useState } from "react";
import {
  DARK_THEME,
  DEFAULT_MANUAL,
  LIGHT_THEME,
  STATUS_COLORS_DARK,
  STATUS_COLORS_LIGHT,
  STORAGE_KEYS,
} from "./lib/constants";
import { durationFromHoursMinutes, earnedFromDuration, formatDate, uid } from "./lib/utils";
import { getSupabaseClient, isSupabaseConfigured } from "./lib/supabase";
import GlobalStyles from "./ui/GlobalStyles";
import MobileTopBar from "./ui/MobileTopBar";
import Sidebar from "./ui/Sidebar";
import WelcomeState from "./ui/WelcomeState";
import TimerHeader from "./ui/TimerHeader";
import ProjectAndDateFilters from "./ui/ProjectAndDateFilters";
import TaskComposer from "./ui/TaskComposer";
import ManualEntry from "./ui/ManualEntry";
import StatsAndExports from "./ui/StatsAndExports";
import SessionsList from "./ui/SessionsList";

function loadJson(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export default function LogrApp() {
  const supabase = getSupabaseClient();

  const [dark, setDark] = useState(false);
  const theme = dark ? DARK_THEME : LIGHT_THEME;
  const statusColors = dark ? STATUS_COLORS_DARK : STATUS_COLORS_LIGHT;

  const [clients, setClients] = useState([]);
  const [sessions, setSessions] = useState([]);

  const [authLoading, setAuthLoading] = useState(() => isSupabaseConfigured());
  const [syncReady, setSyncReady] = useState(false);
  const [syncError, setSyncError] = useState("");
  const [user, setUser] = useState(null);

  const [activeClientId, setActiveClientId] = useState(null);
  const [activeProjectId, setActiveProjectId] = useState("all");

  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const intervalRef = useRef(null);

  const [taskName, setTaskName] = useState("");
  const [taskRate, setTaskRate] = useState("50");
  const [taskNotes, setTaskNotes] = useState("");

  const [showAddClient, setShowAddClient] = useState(false);
  const [showAddProject, setShowAddProject] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newProjectName, setNewProjectName] = useState("");

  const [showManual, setShowManual] = useState(false);
  const [manual, setManual] = useState(DEFAULT_MANUAL);

  const [dateFilter, setDateFilter] = useState("all");
  const [customMonth, setCustomMonth] = useState(() => {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  });

  const [errors, setErrors] = useState({});
  const [mobileView, setMobileView] = useState("main");

  const [editId, setEditId] = useState(null);
  const [editValues, setEditValues] = useState({});

  const resolvedActiveClientId = activeClientId ?? clients[0]?.id ?? null;
  const activeClient = clients.find((client) => client.id === resolvedActiveClientId);
  const activeProjects = activeClient?.projects || [];
  const activeTimedSession = sessions.find((session) => session.id === activeSessionId);

  function showError(key, message) {
    setErrors((prev) => ({ ...prev, [key]: message }));
    setTimeout(() => {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }, 3000);
  }

  useEffect(() => {
    if (!supabase) return;

    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      const nextUser = data.session?.user ?? null;
      setUser(nextUser);
      if (!nextUser) {
        setSyncReady(false);
        setClients([]);
        setSessions([]);
        setRunning(false);
        setElapsed(0);
        setActiveSessionId(null);
      }
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      const nextUser = nextSession?.user ?? null;
      setUser(nextUser);
      if (!nextUser) {
        setSyncReady(false);
        setClients([]);
        setSessions([]);
        setRunning(false);
        setElapsed(0);
        setActiveSessionId(null);
      }
      setAuthLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    if (!supabase || !user) return;

    let ignore = false;

    async function loadUserState() {
      const localClients = loadJson(STORAGE_KEYS.clients, []);
      const localSessions = loadJson(STORAGE_KEYS.sessions, []);

      setSyncReady(false);
      setSyncError("");

      const { data, error, status } = await supabase
        .from("user_app_state")
        .select("clients,sessions")
        .eq("user_id", user.id)
        .maybeSingle();

      if (ignore) return;

      if (error && status !== 406) {
        setSyncError(`Failed to load cloud data: ${error.message}`);
        setClients(localClients);
        setSessions(localSessions);
        setSyncReady(true);
        return;
      }

      if (data) {
        setClients(Array.isArray(data.clients) ? data.clients : []);
        setSessions(Array.isArray(data.sessions) ? data.sessions : []);
      } else {
        setClients(localClients);
        setSessions(localSessions);

        const { error: upsertError } = await supabase.from("user_app_state").upsert(
          {
            user_id: user.id,
            clients: localClients,
            sessions: localSessions,
          },
          { onConflict: "user_id" }
        );

        if (!ignore && upsertError) {
          setSyncError(`Failed to initialize cloud data: ${upsertError.message}`);
        }
      }

      setSyncReady(true);
    }

    loadUserState();

    return () => {
      ignore = true;
    };
  }, [supabase, user]);

  useEffect(() => {
    if (!supabase || !user || !syncReady) return;

    const timer = window.setTimeout(async () => {
      const { error } = await supabase.from("user_app_state").upsert(
        {
          user_id: user.id,
          clients,
          sessions,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

      if (error) {
        setSyncError(`Failed to sync cloud data: ${error.message}`);
        return;
      }

      setSyncError("");
    }, 500);

    return () => window.clearTimeout(timer);
  }, [supabase, user, syncReady, clients, sessions]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEYS.clients, JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEYS.sessions, JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    if (running) {
      intervalRef.current = window.setInterval(() => setElapsed((value) => value + 1), 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [running]);

  const visibleSessions = sessions.filter((session) => {
    if (session.clientId !== resolvedActiveClientId) return false;
    if (activeProjectId !== "all" && session.projectId !== activeProjectId) return false;

    if (dateFilter === "week") {
      const weekAgo = Number(new Date()) - 7 * 24 * 60 * 60 * 1000;
      return session.ts >= weekAgo;
    }

    if (dateFilter === "month") {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
      return session.ts >= start;
    }

    if (dateFilter === "custom") {
      const [year, month] = customMonth.split("-").map(Number);
      const start = new Date(year, month - 1, 1).getTime();
      const end = new Date(year, month, 1).getTime();
      return session.ts >= start && session.ts < end;
    }

    return true;
  });

  const doneSessions = visibleSessions.filter((session) => session.status === "DONE");
  const totalEarned = doneSessions.reduce((sum, session) => sum + session.earned, 0).toFixed(2);
  const totalHours = (doneSessions.reduce((sum, session) => sum + session.duration, 0) / 3600).toFixed(1);

  async function signInWithGoogle() {
    if (!supabase) return;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });

    if (error) {
      showError("auth", `Google sign-in failed: ${error.message}`);
    }
  }

  async function signOut() {
    if (!supabase) return;

    const { error } = await supabase.auth.signOut();
    if (error) {
      showError("auth", `Sign out failed: ${error.message}`);
    }
  }

  function addClient() {
    if (!newClientName.trim()) return;

    const client = { id: uid(), name: newClientName.trim(), projects: [] };
    setClients((prev) => [...prev, client]);
    setActiveClientId(client.id);
    setActiveProjectId("all");
    setNewClientName("");
    setShowAddClient(false);
  }

  function addProject() {
    if (!newProjectName.trim() || !resolvedActiveClientId) return;

    const project = { id: uid(), name: newProjectName.trim() };
    setClients((prev) => prev.map((client) => (client.id === resolvedActiveClientId ? { ...client, projects: [...client.projects, project] } : client)));
    setNewProjectName("");
    setShowAddProject(false);
  }

  function removeClient(clientId) {
    setClients((prev) => prev.filter((client) => client.id !== clientId));
    setSessions((prev) => prev.filter((session) => session.clientId !== clientId));
    setActiveClientId((prev) => (prev === clientId ? null : prev));
  }

  function renameClient(clientId, nextName) {
    const trimmedName = nextName.trim();
    if (!trimmedName) return;
    setClients((prev) => prev.map((client) => (client.id === clientId ? { ...client, name: trimmedName } : client)));
  }

  function startNewSession() {
    if (!taskName.trim()) {
      showError("task", "Task name required");
      return;
    }
    if (!resolvedActiveClientId) {
      showError("task", "Select a client first");
      return;
    }
    if (!taskRate || parseFloat(taskRate) <= 0) {
      showError("rate", "Rate must be > 0");
      return;
    }

    const id = uid();
    setSessions((prev) => [
      {
        id,
        clientId: resolvedActiveClientId,
        projectId: activeProjectId === "all" ? null : activeProjectId,
        name: taskName.trim(),
        notes: taskNotes.trim(),
        duration: 0,
        earned: 0,
        rate: parseFloat(taskRate),
        ts: Date.now(),
        status: "ACTIVE",
      },
      ...prev,
    ]);
    setActiveSessionId(id);
    setElapsed(0);
    setRunning(true);
  }

  function addPendingSession() {
    if (!taskName.trim()) {
      showError("task", "Task name required");
      return;
    }
    if (!resolvedActiveClientId) {
      showError("task", "Select a client first");
      return;
    }

    setSessions((prev) => [
      {
        id: uid(),
        clientId: resolvedActiveClientId,
        projectId: activeProjectId === "all" ? null : activeProjectId,
        name: taskName.trim(),
        notes: taskNotes.trim(),
        duration: 0,
        earned: 0,
        rate: parseFloat(taskRate),
        ts: Date.now(),
        status: "PENDING",
      },
      ...prev,
    ]);
    setTaskName("");
    setTaskNotes("");
  }

  function stopTimer() {
    setRunning(false);
    setSessions((prev) => prev.map((session) => (
      session.id === activeSessionId
        ? {
            ...session,
            duration: elapsed,
            earned: parseFloat(((elapsed / 3600) * session.rate).toFixed(2)),
            status: "DONE",
          }
        : session
    )));
    setActiveSessionId(null);
    setElapsed(0);
    setTaskName("");
    setTaskNotes("");
  }

  useEffect(() => {
    function onKeyDown(event) {
      if (event.code !== "Space") return;
      if (!(event.target instanceof HTMLElement)) return;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName)) return;

      event.preventDefault();

      if (running) {
        setRunning(false);
        setSessions((prev) => prev.map((session) => (
          session.id === activeSessionId
            ? {
                ...session,
                duration: elapsed,
                earned: parseFloat(((elapsed / 3600) * session.rate).toFixed(2)),
                status: "DONE",
              }
            : session
        )));
        setActiveSessionId(null);
        setElapsed(0);
        setTaskName("");
        setTaskNotes("");
        return;
      }

      if (!taskName.trim() || !resolvedActiveClientId) return;

      const id = uid();
      setSessions((prev) => [
        {
          id,
          clientId: resolvedActiveClientId,
          projectId: activeProjectId === "all" ? null : activeProjectId,
          name: taskName.trim(),
          notes: taskNotes.trim(),
          duration: 0,
          earned: 0,
          rate: parseFloat(taskRate),
          ts: Date.now(),
          status: "ACTIVE",
        },
        ...prev,
      ]);
      setActiveSessionId(id);
      setElapsed(0);
      setRunning(true);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [running, activeSessionId, elapsed, taskName, taskNotes, taskRate, resolvedActiveClientId, activeProjectId]);

  function startPendingSession(session) {
    if (running) return;

    setActiveSessionId(session.id);
    setElapsed(session.duration);
    setRunning(true);
    setSessions((prev) => prev.map((item) => (item.id === session.id ? { ...item, status: "ACTIVE" } : item)));
  }

  function addManualSession() {
    const duration = durationFromHoursMinutes(manual.hours, manual.minutes);

    if (!manual.name.trim()) {
      showError("manual", "Task name required");
      return;
    }
    if (!resolvedActiveClientId) {
      showError("manual", "Select a client first");
      return;
    }
    if (manual.status === "DONE" && duration === 0) {
      showError("manual", "Duration required for DONE tasks");
      return;
    }

    setSessions((prev) => [
      {
        id: uid(),
        clientId: resolvedActiveClientId,
        projectId: activeProjectId === "all" ? null : activeProjectId,
        name: manual.name.trim(),
        notes: manual.notes?.trim() || "",
        duration,
        earned: earnedFromDuration(duration, manual.rate),
        rate: parseFloat(manual.rate),
        ts: manual.date ? new Date(manual.date).getTime() : Date.now(),
        status: manual.status,
      },
      ...prev,
    ]);

    setManual(DEFAULT_MANUAL);
    setShowManual(false);
  }

  function startEditSession(session) {
    setEditId(session.id);
    setEditValues({
      name: session.name,
      notes: session.notes || "",
      hours: Math.floor(session.duration / 3600),
      minutes: Math.floor((session.duration % 3600) / 60),
      rate: session.rate,
    });
  }

  function saveEditSession(session) {
    const duration = durationFromHoursMinutes(editValues.hours, editValues.minutes);
    const earned = earnedFromDuration(duration, editValues.rate);

    setSessions((prev) => prev.map((item) => (
      item.id === session.id
        ? {
            ...item,
            name: editValues.name || item.name,
            notes: editValues.notes ?? item.notes,
            duration,
            earned,
            rate: parseFloat(editValues.rate || item.rate),
          }
        : item
    )));
    setEditId(null);
  }

  function exportCsv() {
    const rows = doneSessions.map((session) => {
      const project = (clients.find((client) => client.id === session.clientId)?.projects || []).find((item) => item.id === session.projectId);
      return [
        formatDate(session.ts),
        activeClient?.name || "",
        project?.name || "",
        `"${session.name}"`,
        `"${session.notes || ""}"`,
        (session.duration / 3600).toFixed(2),
        session.rate,
        session.earned,
      ].join(",");
    });

    const csv = ["Date,Client,Project,Task,Notes,Hours,Rate,Earned", ...rows].join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    link.download = `logr-${activeClient?.name || "export"}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  }

  function exportInvoicePdf() {
    const projectName = activeProjectId !== "all" ? activeProjects.find((item) => item.id === activeProjectId)?.name : null;

    const rows = doneSessions
      .map((session) => {
        const project = activeProjects.find((item) => item.id === session.projectId);
        return `<tr><td>${formatDate(session.ts)}</td><td>${session.name}${project ? ` <span style="color:#999;font-size:11px">[${project.name}]</span>` : ""}${session.notes ? `<br><span style="color:#999;font-size:11px">${session.notes}</span>` : ""}</td><td>${(session.duration / 3600).toFixed(2)}h</td><td>$${session.rate}/hr</td><td><strong>$${session.earned}</strong></td></tr>`;
      })
      .join("");

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Invoice — ${activeClient?.name}</title>
    <style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Courier New',monospace;padding:60px;color:#1a1a1a}h1{font-size:48px;letter-spacing:.05em;margin-bottom:4px}.sub{font-size:11px;color:#999;letter-spacing:.2em;text-transform:uppercase;margin-bottom:40px}.meta{display:flex;justify-content:space-between;margin-bottom:40px;font-size:13px}.lbl{font-size:9px;color:#999;letter-spacing:.15em;text-transform:uppercase;margin-bottom:4px}table{width:100%;border-collapse:collapse;margin-bottom:32px}th{font-size:9px;color:#999;letter-spacing:.15em;text-transform:uppercase;text-align:left;padding:8px 0;border-bottom:2px solid #1a1a1a}td{padding:10px 0;border-bottom:1px solid #eee;font-size:13px}.total{text-align:right;font-size:24px}.total .lbl{margin-bottom:4px}</style>
    </head><body>
    <h1>INVOICE</h1><div class="sub">Logr</div>
    <div class="meta">
      <div><div class="lbl">Client</div><div style="font-size:16px;font-weight:bold">${activeClient?.name}</div>${projectName ? `<div class="lbl" style="margin-top:8px">Project</div><div>${projectName}</div>` : ""}</div>
      <div style="text-align:right"><div class="lbl">Date</div><div>${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}</div><div class="lbl" style="margin-top:8px">Invoice #</div><div>INV-${Date.now().toString().slice(-6)}</div></div>
    </div>
    <table><thead><tr><th>Date</th><th>Task</th><th>Hours</th><th>Rate</th><th>Amount</th></tr></thead><tbody>${rows}</tbody></table>
    <div class="total"><div class="lbl">Total Due</div>$${totalEarned}</div>
    <script>window.onload=()=>window.print();</script></body></html>`;

    const popup = window.open("", "_blank");
    popup.document.write(html);
    popup.document.close();
  }

  if (!isSupabaseConfigured()) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, fontFamily: "'DM Mono','Courier New',monospace" }}>
        <div style={{ width: "100%", maxWidth: 620, border: "1px solid #ddd", padding: 24, borderRadius: 12 }}>
          <h1 style={{ fontSize: 20, marginBottom: 12 }}>Supabase is not configured</h1>
          <p style={{ opacity: 0.8, marginBottom: 8 }}>Add these environment variables and restart dev server:</p>
          <pre style={{ whiteSpace: "pre-wrap", background: "#f7f7f7", padding: 12, borderRadius: 8 }}>
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
          </pre>
        </div>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", fontFamily: "'DM Mono','Courier New',monospace" }}>
        <div>Checking session...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, fontFamily: "'DM Mono','Courier New',monospace", background: theme.bg, color: theme.text }}>
        <div style={{ width: "100%", maxWidth: 520, border: `1px solid ${theme.border}`, borderRadius: 16, padding: 24, background: theme.statBg }}>
          <h1 style={{ fontSize: 26, marginBottom: 8 }}>Logr</h1>
          <p style={{ marginBottom: 20, color: theme.muted }}>Sign in with Google to sync your time tracking data to Supabase.</p>
          <button
            onClick={signInWithGoogle}
            style={{
              width: "100%",
              border: `1px solid ${theme.border}`,
              padding: "12px 14px",
              borderRadius: 10,
              fontWeight: 700,
              background: theme.btnBg,
              color: theme.btnColor,
              cursor: "pointer",
            }}
          >
            Continue with Google
          </button>
          {errors.auth ? <p style={{ marginTop: 10, color: "#cc2222" }}>{errors.auth}</p> : null}
        </div>
      </div>
    );
  }

  if (!syncReady) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", fontFamily: "'DM Mono','Courier New',monospace" }}>
        <div>Loading cloud workspace...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: theme.bg, color: theme.text, fontFamily: "'DM Mono','Courier New',monospace", transition: "background 0.2s" }}>
      <GlobalStyles />

      <div style={{ display: "flex", minHeight: "100vh" }}>
        <MobileTopBar
          theme={theme}
          activeClient={activeClient}
          mobileView={mobileView}
          onToggle={() => setMobileView((view) => (view === "clients" ? "main" : "clients"))}
        />

        {mobileView === "clients" && <div onClick={() => setMobileView("main")} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 98 }} />}

        <Sidebar
          theme={theme}
          dark={dark}
          clients={clients}
          activeClientId={resolvedActiveClientId}
          mobileView={mobileView}
          showAddClient={showAddClient}
          newClientName={newClientName}
          setNewClientName={setNewClientName}
          setShowAddClient={setShowAddClient}
          onAddClient={addClient}
          onSelectClient={(clientId) => {
            setActiveClientId(clientId);
            setActiveProjectId("all");
            setMobileView("main");
          }}
          onRemoveClient={removeClient}
          onRenameClient={renameClient}
          onToggleTheme={() => setDark((value) => !value)}
        />

        <div className="main-area" style={{ flex: 1, padding: "32px 40px", maxWidth: 760 }}>
          <div className="mobile-bar" style={{ height: 52 }} />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ fontSize: 12, color: theme.muted }}>
              Signed in as {user.email}
              {syncError ? <span style={{ color: "#cc2222", marginLeft: 10 }}>{syncError}</span> : <span style={{ marginLeft: 10 }}>Synced with Supabase</span>}
            </div>
            <button
              onClick={signOut}
              style={{ border: `1px solid ${theme.border}`, borderRadius: 8, padding: "8px 12px", background: "transparent", color: theme.text, cursor: "pointer" }}
            >
              Sign out
            </button>
          </div>

          {!activeClient ? (
            <WelcomeState theme={theme} />
          ) : (
            <>
              <TimerHeader theme={theme} activeClient={activeClient} activeTimedSession={activeTimedSession} elapsed={elapsed} running={running} />

              <ProjectAndDateFilters
                theme={theme}
                activeProjects={activeProjects}
                activeProjectId={activeProjectId}
                setActiveProjectId={setActiveProjectId}
                showAddProject={showAddProject}
                setShowAddProject={setShowAddProject}
                newProjectName={newProjectName}
                setNewProjectName={setNewProjectName}
                onAddProject={addProject}
                dateFilter={dateFilter}
                setDateFilter={setDateFilter}
                customMonth={customMonth}
                setCustomMonth={setCustomMonth}
              />

              <TaskComposer
                theme={theme}
                running={running}
                taskName={taskName}
                setTaskName={setTaskName}
                taskRate={taskRate}
                setTaskRate={setTaskRate}
                taskNotes={taskNotes}
                setTaskNotes={setTaskNotes}
                onStart={startNewSession}
                onAddPending={addPendingSession}
                onStop={stopTimer}
                errors={errors}
              />

              <ManualEntry
                theme={theme}
                showManual={showManual}
                setShowManual={setShowManual}
                manual={manual}
                setManual={setManual}
                onAddManual={addManualSession}
                errors={errors}
              />

              <StatsAndExports
                theme={theme}
                doneSessions={doneSessions}
                totalHours={totalHours}
                totalEarned={totalEarned}
                onExportCsv={exportCsv}
                onExportInvoicePdf={exportInvoicePdf}
              />

              <SessionsList
                theme={theme}
                statusColors={statusColors}
                running={running}
                visibleSessions={visibleSessions}
                activeProjects={activeProjects}
                editId={editId}
                editValues={editValues}
                setEditValues={setEditValues}
                onStartPending={startPendingSession}
                onStartEdit={startEditSession}
                onCancelEdit={() => setEditId(null)}
                onSaveEdit={saveEditSession}
                onDeleteSession={(sessionId) => setSessions((prev) => prev.filter((item) => item.id !== sessionId))}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
