"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  DARK_THEME,
  LIGHT_THEME,
  STATUS_COLORS_DARK,
  STATUS_COLORS_LIGHT,
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
import StatsAndExports from "./ui/StatsAndExports";
import SessionsList from "./ui/SessionsList";
import SummaryDashboard from "./ui/SummaryDashboard";
import ProfileSettings from "./ui/ProfileSettings";

const CLOUD_CACHE_KEY = "logr-cloud-cache-v1";

function getNowDateTimeLocal() {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offsetMs).toISOString().slice(0, 16);
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
  const [taskRate, setTaskRate] = useState("");
  const [profileHourlyRate, setProfileHourlyRate] = useState("50");
  const [profileTargetHourlyRate, setProfileTargetHourlyRate] = useState("25");
  const [taskBillingType, setTaskBillingType] = useState("hourly");
  const [taskNotes, setTaskNotes] = useState("");
  const [taskStatus, setTaskStatus] = useState("ACTIVE");
  const [profileWorkdayHours, setProfileWorkdayHours] = useState("8");
  const [profileRequireProjectForFixed, setProfileRequireProjectForFixed] = useState(false);
  const [taskDays, setTaskDays] = useState("");
  const [taskHours, setTaskHours] = useState("");
  const [taskMinutes, setTaskMinutes] = useState("");
  const [taskFixedAmount, setTaskFixedAmount] = useState("");
  const [taskDateTime, setTaskDateTime] = useState(() => getNowDateTimeLocal());

  const [showAddClient, setShowAddClient] = useState(false);
  const [showAddProject, setShowAddProject] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectBillingType, setNewProjectBillingType] = useState("hourly");
  const [newProjectRate, setNewProjectRate] = useState("");
  const [newProjectBudget, setNewProjectBudget] = useState("");

  const [dateFilter, setDateFilter] = useState("all");
  const [customMonth, setCustomMonth] = useState(() => {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  });

  const [errors, setErrors] = useState({});
  const [mobileView, setMobileView] = useState("main");
  const [screen, setScreen] = useState("dashboard");

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

  const calculateSessionEarned = useCallback((duration, session) => {
    if (session.billingType === "fixed_project") {
      return 0;
    }
    return parseFloat(((duration / 3600) * parseFloat(session.rate || 0)).toFixed(2));
  }, []);

  function taskDurationSeconds() {
    const days = parseInt(taskDays || 0, 10);
    const dayHours = parseFloat(profileWorkdayHours || 8);
    const normalizedDayHours = Number.isFinite(dayHours) && dayHours > 0 ? dayHours : 8;
    const daysSeconds = (Number.isFinite(days) ? days : 0) * normalizedDayHours * 3600;
    return daysSeconds + durationFromHoursMinutes(taskHours, taskMinutes);
  }

  const resolveTaskRate = useCallback(() => {
    const explicitRate = parseFloat(taskRate || 0);
    if (Number.isFinite(explicitRate) && explicitRate > 0) return explicitRate;
    const profileRate = parseFloat(profileHourlyRate || 0);
    return Number.isFinite(profileRate) ? profileRate : 0;
  }, [taskRate, profileHourlyRate]);

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
        setProfileHourlyRate("50");
        setProfileTargetHourlyRate("25");
        setProfileWorkdayHours("8");
        setProfileRequireProjectForFixed(false);
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
        setProfileHourlyRate("50");
        setProfileTargetHourlyRate("25");
        setProfileWorkdayHours("8");
        setProfileRequireProjectForFixed(false);
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
    let usedCachedState = false;

    try {
      const raw = window.sessionStorage.getItem(CLOUD_CACHE_KEY);
      if (raw) {
        const cached = JSON.parse(raw);
        if (cached?.userId === user.id) {
          const settings = cached.settings || {};
          window.queueMicrotask(() => {
            setClients(Array.isArray(cached.clients) ? cached.clients : []);
            setSessions(Array.isArray(cached.sessions) ? cached.sessions : []);
            setProfileHourlyRate(settings.hourlyRate || "50");
            setProfileTargetHourlyRate(settings.targetHourlyRate || "25");
            setProfileWorkdayHours(settings.workdayHours || "8");
            setProfileRequireProjectForFixed(Boolean(settings.requireProjectForFixed));
            setSyncReady(true);
          });
          usedCachedState = true;
        }
      }
    } catch {}

    async function loadUserState() {
      if (!usedCachedState) setSyncReady(false);
      setSyncError("");

      const { data, error, status } = await supabase
        .from("user_app_state")
        .select("clients,sessions,settings")
        .eq("user_id", user.id)
        .maybeSingle();

      if (ignore) return;

      if (error && status !== 406) {
        setSyncError(`Failed to load cloud data: ${error.message}`);
        setClients([]);
        setSessions([]);
        setProfileHourlyRate("50");
        setProfileTargetHourlyRate("25");
        setProfileWorkdayHours("8");
        setProfileRequireProjectForFixed(false);
        setSyncReady(true);
        return;
      }

      if (data) {
        setClients(Array.isArray(data.clients) ? data.clients : []);
        setSessions(Array.isArray(data.sessions) ? data.sessions : []);
        const settings = data.settings || {};
        setProfileHourlyRate(settings.hourlyRate || "50");
        setProfileTargetHourlyRate(settings.targetHourlyRate || "25");
        setProfileWorkdayHours(settings.workdayHours || "8");
        setProfileRequireProjectForFixed(Boolean(settings.requireProjectForFixed));
      } else {
        setClients([]);
        setSessions([]);
        setProfileHourlyRate("50");
        setProfileTargetHourlyRate("25");
        setProfileWorkdayHours("8");
        setProfileRequireProjectForFixed(false);

        const { error: upsertError } = await supabase.from("user_app_state").upsert(
          {
            user_id: user.id,
            clients: [],
            sessions: [],
            settings: { hourlyRate: "50", targetHourlyRate: "25", workdayHours: "8", requireProjectForFixed: false },
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
    if (!user || !syncReady) return;

    try {
      window.sessionStorage.setItem(
        CLOUD_CACHE_KEY,
        JSON.stringify({
          userId: user.id,
          clients,
          sessions,
          settings: {
            hourlyRate: profileHourlyRate,
            targetHourlyRate: profileTargetHourlyRate,
            workdayHours: profileWorkdayHours,
            requireProjectForFixed: profileRequireProjectForFixed,
          },
          cachedAt: Date.now(),
        }),
      );
    } catch {}
  }, [user, syncReady, clients, sessions, profileHourlyRate, profileTargetHourlyRate, profileWorkdayHours, profileRequireProjectForFixed]);

  useEffect(() => {
    if (!supabase || !user || !syncReady) return;

    const timer = window.setTimeout(async () => {
      const { error } = await supabase.from("user_app_state").upsert(
        {
          user_id: user.id,
          clients,
          sessions,
          settings: {
            hourlyRate: profileHourlyRate,
            targetHourlyRate: profileTargetHourlyRate,
            workdayHours: profileWorkdayHours,
            requireProjectForFixed: profileRequireProjectForFixed,
          },
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
  }, [supabase, user, syncReady, clients, sessions, profileHourlyRate, profileTargetHourlyRate, profileWorkdayHours, profileRequireProjectForFixed]);

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
  const totalEarned = (() => {
    return doneSessions.reduce((sum, session) => {
      const billingType = session.billingType || "hourly";
      if (billingType === "fixed_project") {
        return sum + parseFloat(session.fixedAmount || 0);
      }
      return sum + parseFloat(session.earned || 0);
    }, 0).toFixed(2);
  })();
  const totalHours = (doneSessions.reduce((sum, session) => sum + session.duration, 0) / 3600).toFixed(1);
  const paidTotal = doneSessions.reduce((sum, session) => {
    if ((session.paymentStatus || "UNPAID") !== "PAID") return sum;
    return sum + (session.billingType === "fixed_project" ? parseFloat(session.fixedAmount || 0) : parseFloat(session.earned || 0));
  }, 0);
  const unpaidTotal = doneSessions.reduce((sum, session) => {
    if ((session.paymentStatus || "UNPAID") !== "UNPAID") return sum;
    return sum + (session.billingType === "fixed_project" ? parseFloat(session.fixedAmount || 0) : parseFloat(session.earned || 0));
  }, 0);
  const collectionRate = paidTotal + unpaidTotal > 0 ? ((paidTotal / (paidTotal + unpaidTotal)) * 100).toFixed(1) : "0.0";

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
      return;
    }

    try {
      window.sessionStorage.removeItem(CLOUD_CACHE_KEY);
    } catch {}
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

    const parsedRate = parseFloat(newProjectRate);
    const parsedBudget = parseFloat(newProjectBudget);
    const project = {
      id: uid(),
      name: newProjectName.trim(),
      billingType: newProjectBillingType,
      hourlyRate: newProjectBillingType === "hourly" && Number.isFinite(parsedRate) && parsedRate > 0 ? parseFloat(parsedRate.toFixed(2)) : null,
      fixedBudget: newProjectBillingType === "fixed_project" && Number.isFinite(parsedBudget) && parsedBudget > 0 ? parseFloat(parsedBudget.toFixed(2)) : null,
    };
    setClients((prev) => prev.map((client) => (client.id === resolvedActiveClientId ? { ...client, projects: [...client.projects, project] } : client)));
    setNewProjectName("");
    setNewProjectBillingType("hourly");
    setNewProjectRate("");
    setNewProjectBudget("");
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
    const effectiveRate = resolveTaskRate();
    if (taskBillingType === "hourly" && effectiveRate <= 0) {
      showError("rate", "Rate must be > 0");
      return;
    }
    if (taskBillingType !== "hourly") {
      showError("status", "ACTIVE status is available only for HOURLY");
      return;
    }

    const taskTimestamp = Number.isFinite(Date.parse(taskDateTime)) ? Date.parse(taskDateTime) : Date.now();
    const fixedAmount = 0;

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
        rate: effectiveRate,
        billingType: taskBillingType,
        fixedAmount,
        paymentStatus: "UNPAID",
        ts: taskTimestamp,
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

    const effectiveRate = resolveTaskRate();
    if (taskBillingType === "hourly" && effectiveRate <= 0) {
      showError("rate", "Rate must be > 0");
      return;
    }
    if (taskBillingType === "fixed_project") {
      if (profileRequireProjectForFixed && activeProjectId === "all") {
        showError("rate", "Select a project for fixed task");
        return;
      }
      const inputAmount = parseFloat(taskFixedAmount || 0);
      if (inputAmount <= 0) {
        showError("rate", "Set fixed amount");
        return;
      }
    }

    const taskTimestamp = Number.isFinite(Date.parse(taskDateTime)) ? Date.parse(taskDateTime) : Date.now();
    const inputAmount = parseFloat(taskFixedAmount || 0);
    const fixedAmount = taskBillingType === "fixed_project" ? inputAmount : 0;
    const duration = taskDurationSeconds();
    const days = parseFloat(taskDays || 0);
    const hours = parseFloat(taskHours || 0);
    const minutes = parseFloat(taskMinutes || 0);
    const workdayHours = parseFloat(profileWorkdayHours || 8);
    const hourlyRate = taskBillingType === "hourly" ? effectiveRate : 0;
    const earned = taskBillingType === "hourly" ? earnedFromDuration(duration, hourlyRate) : 0;

    setSessions((prev) => [
      {
        id: uid(),
        clientId: resolvedActiveClientId,
        projectId: activeProjectId === "all" ? null : activeProjectId,
        name: taskName.trim(),
        notes: taskNotes.trim(),
        duration,
        days: Number.isFinite(days) ? days : 0,
        hours: Number.isFinite(hours) ? hours : 0,
        minutes: Number.isFinite(minutes) ? minutes : 0,
        workdayHours: Number.isFinite(workdayHours) && workdayHours > 0 ? workdayHours : 8,
        earned,
        rate: hourlyRate,
        billingType: taskBillingType,
        fixedAmount,
        paymentStatus: "UNPAID",
        ts: taskTimestamp,
        status: "PENDING",
      },
      ...prev,
    ]);
    setTaskName("");
    setTaskRate("");
    setTaskNotes("");
    setTaskDays("");
    setTaskHours("");
    setTaskMinutes("");
    setTaskFixedAmount("");
    setTaskDateTime(getNowDateTimeLocal());
  }

  function addDoneSession() {
    if (!taskName.trim()) {
      showError("task", "Task name required");
      return;
    }
    if (!resolvedActiveClientId) {
      showError("task", "Select a client first");
      return;
    }
    const effectiveRate = resolveTaskRate();
    if (taskBillingType === "hourly" && effectiveRate <= 0) {
      showError("rate", "Rate must be > 0");
      return;
    }
    if (taskBillingType === "fixed_project") {
      if (profileRequireProjectForFixed && activeProjectId === "all") {
        showError("rate", "Select a project for fixed task");
        return;
      }
      const inputAmount = parseFloat(taskFixedAmount || 0);
      if (inputAmount <= 0) {
        showError("rate", "Set fixed amount");
        return;
      }
    }

    const taskTimestamp = Number.isFinite(Date.parse(taskDateTime)) ? Date.parse(taskDateTime) : Date.now();
    const inputAmount = parseFloat(taskFixedAmount || 0);
    const fixedAmount = taskBillingType === "fixed_project" ? inputAmount : 0;
    const days = parseFloat(taskDays || 0);
    const hours = parseFloat(taskHours || 0);
    const minutes = parseFloat(taskMinutes || 0);
    const workdayHours = parseFloat(profileWorkdayHours || 8);
    const hourlyRate = taskBillingType === "hourly" ? effectiveRate : 0;
    const duration = taskDurationSeconds();
    if (duration === 0) {
      showError("duration", "Duration required for DONE");
      return;
    }
    const earned = taskBillingType === "hourly" ? earnedFromDuration(duration, hourlyRate) : 0;

    setSessions((prev) => [
      {
        id: uid(),
        clientId: resolvedActiveClientId,
        projectId: activeProjectId === "all" ? null : activeProjectId,
        name: taskName.trim(),
        notes: taskNotes.trim(),
        duration,
        days: Number.isFinite(days) ? days : 0,
        hours: Number.isFinite(hours) ? hours : 0,
        minutes: Number.isFinite(minutes) ? minutes : 0,
        workdayHours: Number.isFinite(workdayHours) && workdayHours > 0 ? workdayHours : 8,
        earned,
        rate: hourlyRate,
        billingType: taskBillingType,
        fixedAmount,
        paymentStatus: "UNPAID",
        ts: taskTimestamp,
        status: "DONE",
      },
      ...prev,
    ]);
    setTaskName("");
    setTaskRate("");
    setTaskNotes("");
    setTaskDays("");
    setTaskHours("");
    setTaskMinutes("");
    setTaskFixedAmount("");
    setTaskDateTime(getNowDateTimeLocal());
  }

  function submitTaskByStatus() {
    if (taskStatus === "PENDING") {
      addPendingSession();
      return;
    }
    if (taskStatus === "DONE") {
      addDoneSession();
      return;
    }
    startNewSession();
  }

  function stopTimer() {
    setRunning(false);
    setSessions((prev) => prev.map((session) => (
      session.id === activeSessionId
        ? {
            ...session,
            duration: elapsed,
            earned: calculateSessionEarned(elapsed, session),
            status: "DONE",
          }
        : session
    )));
    setActiveSessionId(null);
    setElapsed(0);
    setTaskName("");
    setTaskRate("");
    setTaskNotes("");
    setTaskDays("");
    setTaskHours("");
    setTaskMinutes("");
    setTaskFixedAmount("");
    setTaskDateTime(getNowDateTimeLocal());
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
                earned: calculateSessionEarned(elapsed, session),
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
      if (taskBillingType !== "hourly") return;
      const effectiveRate = resolveTaskRate();
      if (taskBillingType === "hourly" && effectiveRate <= 0) return;
      if (taskBillingType === "fixed_project") return;

      const fixedAmount = 0;
      const taskTimestamp = Number.isFinite(Date.parse(taskDateTime)) ? Date.parse(taskDateTime) : Date.now();

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
          rate: effectiveRate,
          billingType: taskBillingType,
          fixedAmount,
          paymentStatus: "UNPAID",
          ts: taskTimestamp,
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
  }, [running, activeSessionId, elapsed, taskName, taskNotes, taskRate, profileHourlyRate, taskBillingType, taskDateTime, resolvedActiveClientId, activeProjectId, calculateSessionEarned, resolveTaskRate]);

  function startPendingSession(session) {
    if (running) return;

    if ((session.billingType || "hourly") !== "hourly") {
      setSessions((prev) => prev.map((item) => (item.id === session.id ? { ...item, status: "DONE" } : item)));
      return;
    }

    setActiveSessionId(session.id);
    setElapsed(session.duration);
    setRunning(true);
    setSessions((prev) => prev.map((item) => (item.id === session.id ? { ...item, status: "ACTIVE" } : item)));
  }

  function startEditSession(session) {
    setEditId(session.id);
    setEditValues({
      name: session.name,
      notes: session.notes || "",
      hours: Math.floor(session.duration / 3600),
      minutes: Math.floor((session.duration % 3600) / 60),
      billingType: session.billingType || "hourly",
      rate: session.rate || 0,
      fixedAmount: session.fixedAmount || 0,
    });
  }

  function saveEditSession(session) {
    const duration = durationFromHoursMinutes(editValues.hours, editValues.minutes);
    const billingType = editValues.billingType || "hourly";
    const rate = parseFloat(editValues.rate || session.rate || 0);
    const fixedAmount = parseFloat(editValues.fixedAmount || session.fixedAmount || 0);
    const earned = billingType === "hourly" ? earnedFromDuration(duration, rate) : 0;

    setSessions((prev) => prev.map((item) => (
      item.id === session.id
        ? {
            ...item,
            name: editValues.name || item.name,
            notes: editValues.notes ?? item.notes,
            duration,
            earned,
            billingType,
            rate,
            fixedAmount,
          }
        : item
    )));
    setEditId(null);
  }

  function togglePaymentStatus(sessionId) {
    setSessions((prev) => prev.map((item) => (
      item.id === sessionId
        ? { ...item, paymentStatus: (item.paymentStatus || "UNPAID") === "PAID" ? "UNPAID" : "PAID" }
        : item
    )));
  }

  function exportCsv() {
    const countedProjects = new Set();
    const rows = doneSessions.map((session) => {
      const project = (clients.find((client) => client.id === session.clientId)?.projects || []).find((item) => item.id === session.projectId);
      const billingType = session.billingType || "hourly";
      const billingTypeLabel = billingType === "hourly" ? "hourly" : "fixed";
      let billedAmount = parseFloat(session.earned || 0);
      if (billingType === "fixed_project") {
        if (session.projectId && !countedProjects.has(session.projectId)) {
          billedAmount = parseFloat(session.fixedAmount || 0);
          countedProjects.add(session.projectId);
        } else {
          billedAmount = 0;
        }
      }
      const billingValue = billingType === "hourly" ? `${session.rate}/hr` : `$${parseFloat(session.fixedAmount || 0).toFixed(2)} fixed`;
      return [
        formatDate(session.ts),
        activeClient?.name || "",
        project?.name || "",
        `"${session.name}"`,
        `"${session.notes || ""}"`,
        (session.duration / 3600).toFixed(2),
        billingTypeLabel,
        billingValue,
        billedAmount.toFixed(2),
      ].join(",");
    });

    const csv = ["Date,Client,Project,Task,Notes,Hours,Billing Type,Billing Value,Earned", ...rows].join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    link.download = `logr-${activeClient?.name || "export"}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  }

  function exportInvoicePdf() {
    const projectName = activeProjectId !== "all" ? activeProjects.find((item) => item.id === activeProjectId)?.name : null;
    const invoiceDate = new Date();
    const invoiceDateLabel = invoiceDate.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
    const invoiceId = `INV-${invoiceDate.getTime().toString().slice(-6)}`;

    const countedProjects = new Set();
    const rows = doneSessions
      .map((session) => {
        const project = activeProjects.find((item) => item.id === session.projectId);
        const billingType = session.billingType || "hourly";
        const billingLabel = billingType === "hourly" ? `$${session.rate}/hr` : `$${parseFloat(session.fixedAmount || session.earned || 0).toFixed(2)} fixed`;
        let billedAmount = parseFloat(session.earned || 0);
        if (billingType === "fixed_project") {
          if (session.projectId && !countedProjects.has(session.projectId)) {
            billedAmount = parseFloat(session.fixedAmount || 0);
            countedProjects.add(session.projectId);
          } else {
            billedAmount = 0;
          }
        }
        return `<tr><td>${formatDate(session.ts)}</td><td>${session.name}${project ? ` <span style="color:#999;font-size:11px">[${project.name}]</span>` : ""}${session.notes ? `<br><span style="color:#999;font-size:11px">${session.notes}</span>` : ""}</td><td>${(session.duration / 3600).toFixed(2)}h</td><td>${billingLabel}</td><td><strong>$${billedAmount.toFixed(2)}</strong></td></tr>`;
      })
      .join("");

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Invoice — ${activeClient?.name}</title>
    <style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Instrument Sans',Arial,sans-serif;padding:60px;color:#111}h1{font-family:'Instrument Serif',serif;font-size:48px;letter-spacing:-.02em;margin-bottom:4px;font-weight:400}.sub{font-size:11px;color:#999;letter-spacing:.2em;text-transform:uppercase;margin-bottom:40px}.meta{display:flex;justify-content:space-between;margin-bottom:40px;font-size:13px}.lbl{font-size:9px;color:#999;letter-spacing:.15em;text-transform:uppercase;margin-bottom:4px}table{width:100%;border-collapse:collapse;margin-bottom:32px}th{font-size:9px;color:#999;letter-spacing:.15em;text-transform:uppercase;text-align:left;padding:8px 0;border-bottom:2px solid #111}td{padding:10px 0;border-bottom:1px solid #eee;font-size:13px}.total{text-align:right;font-size:24px;font-family:'Instrument Serif',serif}.total .lbl{margin-bottom:4px}</style>
    </head><body>
    <h1>INVOICE</h1><div class="sub">Logr</div>
    <div class="meta">
      <div><div class="lbl">Client</div><div style="font-size:16px;font-weight:bold">${activeClient?.name}</div>${projectName ? `<div class="lbl" style="margin-top:8px">Project</div><div>${projectName}</div>` : ""}</div>
      <div style="text-align:right"><div class="lbl">Date</div><div>${invoiceDateLabel}</div><div class="lbl" style="margin-top:8px">Invoice #</div><div>${invoiceId}</div></div>
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
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, fontFamily: "'Instrument Sans',sans-serif" }}>
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
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", fontFamily: "'Instrument Sans',sans-serif" }}>
        <div>Checking session...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, fontFamily: "'Instrument Sans',sans-serif", background: theme.bg, color: theme.text }}>
        <div style={{ width: "100%", maxWidth: 520, border: `1px solid ${theme.border}`, borderRadius: 16, padding: 24, background: theme.statBg }}>
          <h1 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 32, fontWeight: 400, marginBottom: 8 }}>Logr</h1>
          <p style={{ marginBottom: 20, color: theme.muted }}>Sign in with Google to sync your time tracking data to Supabase.</p>
          <button
            onClick={signInWithGoogle}
            style={{
              width: "100%",
              border: `1px solid ${theme.border}`,
              padding: "12px 14px",
              borderRadius: 0,
              fontWeight: 400,
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
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", fontFamily: "'Instrument Sans',sans-serif" }}>
        <div>Loading cloud workspace...</div>
      </div>
    );
  }

  return (
    <div className="logr-app" style={{ minHeight: "100vh", background: theme.bg, color: theme.text, fontFamily: "'Instrument Sans',sans-serif", transition: "background 0.2s" }}>
      <GlobalStyles />

      <div style={{ display: "flex", minHeight: "100vh" }}>
        <MobileTopBar
          theme={theme}
          activeClient={activeClient}
          mobileView={mobileView}
          screen={screen}
          onToggle={() => setMobileView((view) => (view === "clients" ? "main" : "clients"))}
        />

        {mobileView === "clients" && <div onClick={() => setMobileView("main")} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 98 }} />}

        <Sidebar
          theme={theme}
          dark={dark}
          screen={screen}
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
          onSelectScreen={(nextScreen) => {
            setScreen(nextScreen);
            if (nextScreen === "dashboard" || nextScreen === "profile") {
              setMobileView("main");
            }
          }}
          onToggleTheme={() => setDark((value) => !value)}
        />

        <div className="main-area" style={{ flex: 1, padding: "32px 40px", maxWidth: 1160 }}>
          <div className="mobile-bar" style={{ height: 52 }} />

          {screen === "dashboard" ? (
            <SummaryDashboard theme={theme} clients={clients} sessions={sessions} targetHourlyRate={parseFloat(profileTargetHourlyRate || 25)} />
          ) : screen === "profile" ? (
            <ProfileSettings
              theme={theme}
              user={user}
              syncError={syncError}
              onSignOut={signOut}
              hourlyRate={profileHourlyRate}
              setHourlyRate={setProfileHourlyRate}
              targetHourlyRate={profileTargetHourlyRate}
              setTargetHourlyRate={setProfileTargetHourlyRate}
              workdayHours={profileWorkdayHours}
              setWorkdayHours={setProfileWorkdayHours}
              requireProjectForFixed={profileRequireProjectForFixed}
              setRequireProjectForFixed={setProfileRequireProjectForFixed}
            />
          ) : !activeClient ? (
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
                newProjectBillingType={newProjectBillingType}
                setNewProjectBillingType={setNewProjectBillingType}
                newProjectRate={newProjectRate}
                setNewProjectRate={setNewProjectRate}
                newProjectBudget={newProjectBudget}
                setNewProjectBudget={setNewProjectBudget}
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
                profileHourlyRate={profileHourlyRate}
                profileWorkdayHours={profileWorkdayHours}
                taskBillingType={taskBillingType}
                setTaskBillingType={setTaskBillingType}
                taskStatus={taskStatus}
                setTaskStatus={setTaskStatus}
                taskDays={taskDays}
                setTaskDays={setTaskDays}
                taskHours={taskHours}
                setTaskHours={setTaskHours}
                taskMinutes={taskMinutes}
                setTaskMinutes={setTaskMinutes}
                taskFixedAmount={taskFixedAmount}
                setTaskFixedAmount={setTaskFixedAmount}
                taskDateTime={taskDateTime}
                setTaskDateTime={setTaskDateTime}
                taskNotes={taskNotes}
                setTaskNotes={setTaskNotes}
                onSubmit={submitTaskByStatus}
                onStop={stopTimer}
                errors={errors}
              />

              <StatsAndExports
                theme={theme}
                doneSessions={doneSessions}
                totalHours={totalHours}
                totalEarned={totalEarned}
                paidTotal={paidTotal.toFixed(2)}
                unpaidTotal={unpaidTotal.toFixed(2)}
                collectionRate={collectionRate}
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
                onTogglePaymentStatus={togglePaymentStatus}
                onDeleteSession={(sessionId) => setSessions((prev) => prev.filter((item) => item.id !== sessionId))}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
