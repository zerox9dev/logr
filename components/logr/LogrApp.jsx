"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import "./lib/i18n";
import {
  DARK_THEME,
  LIGHT_THEME,
  STATUS_COLORS_DARK,
  STATUS_COLORS_LIGHT,
} from "./lib/constants";
import { durationFromHoursMinutes, earnedFromDuration, formatDate, formatMoney, formatTime, normalizeCurrency, uid } from "./lib/utils";
import { getSupabaseClient, isSupabaseConfigured } from "./lib/supabase";
import {
  getClientProfiles,
  getLeads,
  getInvoices,
  getFunnelsWithStages,
  createFunnelWithStages,
  updateFunnelStage,
  deleteFunnelWithLeads,
  createLead,
  updateLead,
  deleteLead,
  createInvoice,
  updateInvoice,
  deleteInvoice,
} from "./lib/crm";
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
import GuidedTour from "./ui/GuidedTour";
import ClientCard from "./ui/ClientCard";
import Pipeline from "./ui/Pipeline";
import InvoicesList from "./ui/InvoicesList";

const CLOUD_CACHE_KEY = "logr-cloud-cache-v1";
const ONBOARDING_CACHE_KEY = "logr-onboarding-completed-v1";
const LANGUAGE_STORAGE_KEY = "logr-language-v1";
const ACTIVE_FUNNEL_STORAGE_KEY = "logr-active-funnel-v1";

function getNowDateTimeLocal() {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offsetMs).toISOString().slice(0, 16);
}

function convertNumeric(value, rate) {
  const parsed = parseFloat(value || 0);
  if (!Number.isFinite(parsed)) return value;
  return (parsed * rate).toFixed(2);
}

function convertMoneyNumber(value, rate) {
  const parsed = parseFloat(value || 0);
  if (!Number.isFinite(parsed)) return value;
  return parseFloat((parsed * rate).toFixed(2));
}

function normalizeLanguage(value) {
  return ["en", "ru", "uk"].includes(value) ? value : "en";
}

const ALLOWED_SCREENS = ["dashboard", "tracker", "clients", "pipeline", "invoices", "profile"];

export default function LogrApp({ initialScreen = "tracker" }) {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const supabase = getSupabaseClient();
  const defaultLanguage = "en";

  const [dark, setDark] = useState(false);
  const theme = dark ? DARK_THEME : LIGHT_THEME;
  const statusColors = dark ? STATUS_COLORS_DARK : STATUS_COLORS_LIGHT;

  const [clients, setClients] = useState([]);
  const [sessions, setSessions] = useState([]);

  // CRM state
  const [clientProfiles, setClientProfiles] = useState([]);
  const [funnels, setFunnels] = useState([]);
  const [activeFunnelId, setActiveFunnelId] = useState(null);
  const [leads, setLeads] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [crmLoading, setCrmLoading] = useState(false);

  const [authLoading, setAuthLoading] = useState(() => isSupabaseConfigured());
  const [syncReady, setSyncReady] = useState(false);
  const [syncError, setSyncError] = useState("");
  const [user, setUser] = useState(null);

  const [activeClientId, setActiveClientId] = useState(null);
  const [activeProjectId, setActiveProjectId] = useState("all");

  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const intervalRef = useRef(null);
  const timerStartedAtRef = useRef(null);
  const elapsedBeforeRunRef = useRef(0);
  const defaultTitleRef = useRef("");

  const [taskName, setTaskName] = useState("");
  const [taskRate, setTaskRate] = useState("");
  const [profileHourlyRate, setProfileHourlyRate] = useState("50");
  const [profileCurrency, setProfileCurrency] = useState("USD");
  const [profileLanguage, setProfileLanguage] = useState(defaultLanguage);
  const [isCurrencyConverting, setIsCurrencyConverting] = useState(false);
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
  const [screen, setScreen] = useState(
    ALLOWED_SCREENS.includes(initialScreen) ? initialScreen : "tracker"
  );

  const [editId, setEditId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [showTour, setShowTour] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return window.localStorage.getItem(ONBOARDING_CACHE_KEY) !== "1";
    } catch {
      return false;
    }
  });
  const [tourStep, setTourStep] = useState(0);

  const handleSetLanguage = useCallback((nextLanguage) => {
    setProfileLanguage(normalizeLanguage(nextLanguage));
  }, []);

  const resolvedActiveClientId = activeClientId ?? clients[0]?.id ?? null;
  const activeClient = clients.find((client) => client.id === resolvedActiveClientId);
  const activeFunnel = funnels.find((funnel) => funnel.id === activeFunnelId) || funnels[0] || null;
  const activeProjects = activeClient?.projects || [];
  const activeTimedSession = sessions.find((session) => session.id === activeSessionId);
  const tourSteps = useMemo(() => ([
    { selector: '[data-tour="add-client-btn"]', title: t("tour.s1t"), description: t("tour.s1d") },
    { selector: '[data-tour="add-project-btn"]', title: t("tour.s2t"), description: t("tour.s2d") },
    { selector: '[data-tour="task-name-input"]', title: t("tour.s3t"), description: t("tour.s3d") },
    { selector: '[data-tour="status-select"]', title: t("tour.s4t"), description: t("tour.s4d") },
    { selector: '[data-tour="submit-task-btn"]', title: t("tour.s5t"), description: t("tour.s5d") },
    { selector: '[data-tour="invoice-btn"]', title: t("tour.s6t"), description: t("tour.s6d") },
  ]), [t]);

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

  function getElapsedNow() {
    if (timerStartedAtRef.current == null) return elapsedBeforeRunRef.current;
    const deltaSeconds = Math.floor((Date.now() - timerStartedAtRef.current) / 1000);
    return elapsedBeforeRunRef.current + Math.max(0, deltaSeconds);
  }

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
    defaultTitleRef.current = document.title || "Logr";
    return () => {
      document.title = defaultTitleRef.current || "Logr";
    };
  }, []);

  useEffect(() => {
    try {
      const storedLanguage = normalizeLanguage(window.localStorage.getItem(LANGUAGE_STORAGE_KEY));
      if (storedLanguage !== profileLanguage) {
        setProfileLanguage(storedLanguage);
      }
    } catch {}
    // Run only once on mount to avoid hydration mismatch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        setClientProfiles([]);
        setFunnels([]);
        setActiveFunnelId(null);
        setLeads([]);
        setInvoices([]);
        setProfileHourlyRate("50");
        setProfileCurrency("USD");
        setProfileLanguage(defaultLanguage);
        setProfileWorkdayHours("8");
        setProfileRequireProjectForFixed(false);
        setRunning(false);
        setPaused(false);
        setElapsed(0);
        setActiveSessionId(null);
        timerStartedAtRef.current = null;
        elapsedBeforeRunRef.current = 0;
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
        setClientProfiles([]);
        setFunnels([]);
        setActiveFunnelId(null);
        setLeads([]);
        setInvoices([]);
        setProfileHourlyRate("50");
        setProfileCurrency("USD");
        setProfileLanguage(defaultLanguage);
        setProfileWorkdayHours("8");
        setProfileRequireProjectForFixed(false);
        setRunning(false);
        setPaused(false);
        setElapsed(0);
        setActiveSessionId(null);
        timerStartedAtRef.current = null;
        elapsedBeforeRunRef.current = 0;
      }
      setAuthLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, defaultLanguage]);

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
            setProfileCurrency(normalizeCurrency(settings.currency));
            setProfileLanguage(normalizeLanguage(settings.language));
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
        setProfileCurrency("USD");
        setProfileLanguage(defaultLanguage);
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
        setProfileCurrency(normalizeCurrency(settings.currency));
        setProfileLanguage(normalizeLanguage(settings.language));
        setProfileWorkdayHours(settings.workdayHours || "8");
        setProfileRequireProjectForFixed(Boolean(settings.requireProjectForFixed));
      } else {
        setClients([]);
        setSessions([]);
        setProfileHourlyRate("50");
        setProfileCurrency("USD");
        setProfileLanguage(defaultLanguage);
        setProfileWorkdayHours("8");
        setProfileRequireProjectForFixed(false);

        const { error: upsertError } = await supabase.from("user_app_state").upsert(
          {
            user_id: user.id,
            clients: [],
            sessions: [],
            settings: { hourlyRate: "50", currency: "USD", language: defaultLanguage, workdayHours: "8", requireProjectForFixed: false },
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
  }, [supabase, user, defaultLanguage]);

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
            currency: profileCurrency,
            language: profileLanguage,
            workdayHours: profileWorkdayHours,
            requireProjectForFixed: profileRequireProjectForFixed,
          },
          cachedAt: Date.now(),
        }),
      );
    } catch {}
  }, [user, syncReady, clients, sessions, profileHourlyRate, profileCurrency, profileLanguage, profileWorkdayHours, profileRequireProjectForFixed]);

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
            currency: profileCurrency,
            language: profileLanguage,
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
  }, [supabase, user, syncReady, clients, sessions, profileHourlyRate, profileCurrency, profileLanguage, profileWorkdayHours, profileRequireProjectForFixed]);

  useEffect(() => {
    i18n.changeLanguage(profileLanguage);
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, profileLanguage);
    } catch {}
  }, [i18n, profileLanguage]);

  // Load CRM data after syncReady
  useEffect(() => {
    if (!user || !syncReady) return;
    let ignore = false;
    setCrmLoading(true);

    async function loadCrmData() {
      const [profilesRes, leadsRes, invoicesRes, funnelsRes] = await Promise.all([
        getClientProfiles(user.id),
        getLeads(user.id),
        getInvoices(user.id),
        getFunnelsWithStages(user.id),
      ]);

      if (ignore) return;

      if (profilesRes.data) setClientProfiles(profilesRes.data);
      if (leadsRes.data) setLeads(leadsRes.data);
      if (invoicesRes.data) setInvoices(invoicesRes.data);

      let nextFunnels = funnelsRes.data || [];

      if (nextFunnels.length === 0) {
        const { data: defaultFunnel } = await createFunnelWithStages(user.id, { type: "freelancer" });
        if (!ignore && defaultFunnel) {
          nextFunnels = [defaultFunnel];
        }
      }

      if (!ignore) {
        setFunnels(nextFunnels);
        const storedFunnelId = typeof window !== "undefined"
          ? window.localStorage.getItem(ACTIVE_FUNNEL_STORAGE_KEY)
          : null;
        const hasStored = storedFunnelId && nextFunnels.some((funnel) => funnel.id === storedFunnelId);
        setActiveFunnelId(hasStored ? storedFunnelId : (nextFunnels[0]?.id || null));
        setCrmLoading(false);
      }
    }

    loadCrmData();
    return () => { ignore = true; };
  }, [user, syncReady]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!activeFunnelId) return;
    window.localStorage.setItem(ACTIVE_FUNNEL_STORAGE_KEY, activeFunnelId);
  }, [activeFunnelId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const targetPath = screen === "dashboard" ? "/dashboard" : "/tracker";
    if (window.location.pathname === targetPath) return;
    router.push(targetPath);
  }, [screen, router]);

  useEffect(() => {
    if (funnels.length === 0) return;
    if (activeFunnelId && funnels.some((funnel) => funnel.id === activeFunnelId)) return;
    setActiveFunnelId(funnels[0].id);
  }, [funnels, activeFunnelId]);

  useEffect(() => {
    if (running && !paused) {
      setElapsed(getElapsedNow());
      intervalRef.current = window.setInterval(() => setElapsed(getElapsedNow()), 1000);
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
  }, [running, paused]);

  useEffect(() => {
    if (!running || paused) return;
    const syncElapsed = () => setElapsed(getElapsedNow());
    document.addEventListener("visibilitychange", syncElapsed);
    window.addEventListener("focus", syncElapsed);
    return () => {
      document.removeEventListener("visibilitychange", syncElapsed);
      window.removeEventListener("focus", syncElapsed);
    };
  }, [running, paused]);

  useEffect(() => {
    const baseTitle = defaultTitleRef.current || "Logr";
    if (!running) {
      document.title = baseTitle;
      return;
    }
    const statusTitle = paused ? `PAUSED ${formatTime(elapsed)}` : `${formatTime(elapsed)} RUNNING`;
    const taskTitle = activeTimedSession?.name?.trim();
    document.title = taskTitle ? `${statusTitle} · ${taskTitle}` : `${statusTitle} · Logr`;
  }, [running, paused, elapsed, activeTimedSession]);

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
  const unpaidDoneSessions = doneSessions.filter((session) => (session.paymentStatus || "UNPAID") === "UNPAID");
  const totalEarned = doneSessions.reduce((sum, session) => {
    const billingType = session.billingType || "hourly";
    if (billingType === "fixed_project") {
      return sum + parseFloat(session.fixedAmount || 0);
    }
    return sum + parseFloat(session.earned || 0);
  }, 0);
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
      options: { redirectTo: `${window.location.origin}/tracker` },
    });

    if (error) {
      showError("auth", t("app.errors.googleSignIn", { message: error.message }));
    }
  }

  async function signOut() {
    if (!supabase) return;

    const { error } = await supabase.auth.signOut();
    if (error) {
      showError("auth", t("app.errors.signOut", { message: error.message }));
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
      showError("task", t("app.errors.taskNameRequired"));
      return;
    }
    if (!resolvedActiveClientId) {
      showError("task", t("app.errors.selectClientFirst"));
      return;
    }
    const effectiveRate = resolveTaskRate();
    if (taskBillingType === "hourly" && effectiveRate <= 0) {
      showError("rate", t("app.errors.ratePositive"));
      return;
    }
    if (taskBillingType !== "hourly") {
      showError("status", t("app.errors.activeOnlyHourly"));
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
    elapsedBeforeRunRef.current = 0;
    timerStartedAtRef.current = Date.now();
    setPaused(false);
    setRunning(true);
  }

  function addPendingSession() {
    if (!taskName.trim()) {
      showError("task", t("app.errors.taskNameRequired"));
      return;
    }
    if (!resolvedActiveClientId) {
      showError("task", t("app.errors.selectClientFirst"));
      return;
    }

    const effectiveRate = resolveTaskRate();
    if (taskBillingType === "hourly" && effectiveRate <= 0) {
      showError("rate", t("app.errors.ratePositive"));
      return;
    }
    if (taskBillingType === "fixed_project") {
      if (profileRequireProjectForFixed && activeProjectId === "all") {
        showError("rate", t("app.errors.selectProjectForFixed"));
        return;
      }
      const inputAmount = parseFloat(taskFixedAmount || 0);
      if (inputAmount <= 0) {
        showError("rate", t("app.errors.setFixedAmount"));
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
      showError("task", t("app.errors.taskNameRequired"));
      return;
    }
    if (!resolvedActiveClientId) {
      showError("task", t("app.errors.selectClientFirst"));
      return;
    }
    const effectiveRate = resolveTaskRate();
    if (taskBillingType === "hourly" && effectiveRate <= 0) {
      showError("rate", t("app.errors.ratePositive"));
      return;
    }
    if (taskBillingType === "fixed_project") {
      if (profileRequireProjectForFixed && activeProjectId === "all") {
        showError("rate", t("app.errors.selectProjectForFixed"));
        return;
      }
      const inputAmount = parseFloat(taskFixedAmount || 0);
      if (inputAmount <= 0) {
        showError("rate", t("app.errors.setFixedAmount"));
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
      showError("duration", t("app.errors.durationRequiredDone"));
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
    const finalElapsed = getElapsedNow();
    setRunning(false);
    setPaused(false);
    setSessions((prev) => prev.map((session) => (
      session.id === activeSessionId
        ? {
            ...session,
            duration: finalElapsed,
            earned: calculateSessionEarned(finalElapsed, session),
            status: "DONE",
          }
        : session
    )));
    setActiveSessionId(null);
    timerStartedAtRef.current = null;
    elapsedBeforeRunRef.current = 0;
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

  function pauseTimer() {
    if (!running || paused) return;
    const pausedElapsed = getElapsedNow();
    timerStartedAtRef.current = null;
    elapsedBeforeRunRef.current = pausedElapsed;
    setElapsed(pausedElapsed);
    setPaused(true);
    setSessions((prev) => prev.map((session) => (
      session.id === activeSessionId
        ? {
            ...session,
            duration: pausedElapsed,
            earned: calculateSessionEarned(pausedElapsed, session),
          }
        : session
    )));
  }

  function resumeTimer() {
    if (!running || !paused) return;
    timerStartedAtRef.current = Date.now();
    setPaused(false);
  }

  async function changeCurrency(nextCurrency) {
    const normalizedNextCurrency = normalizeCurrency(nextCurrency);
    if (normalizedNextCurrency === profileCurrency || isCurrencyConverting) return;

    setIsCurrencyConverting(true);

    try {
      const response = await fetch(`/api/exchange-rates?base=${profileCurrency}&symbols=${normalizedNextCurrency}`);
      if (!response.ok) throw new Error(t("app.errors.currencyRateFailed"));
      const payload = await response.json();
      const rate = payload?.rates?.[normalizedNextCurrency];
      if (!Number.isFinite(rate) || rate <= 0) throw new Error(t("app.errors.currencyInvalidRate"));

      const conversionRate = Number(rate);

      setProfileHourlyRate((prev) => convertNumeric(prev, conversionRate));
      setTaskRate((prev) => convertNumeric(prev, conversionRate));
      setTaskFixedAmount((prev) => convertNumeric(prev, conversionRate));
      setNewProjectRate((prev) => convertNumeric(prev, conversionRate));
      setNewProjectBudget((prev) => convertNumeric(prev, conversionRate));
      setEditValues((prev) => ({
        ...prev,
        rate: prev.rate !== undefined ? convertNumeric(prev.rate, conversionRate) : prev.rate,
        fixedAmount: prev.fixedAmount !== undefined ? convertNumeric(prev.fixedAmount, conversionRate) : prev.fixedAmount,
      }));

      setClients((prev) => prev.map((client) => ({
        ...client,
        projects: (client.projects || []).map((project) => ({
          ...project,
          hourlyRate: project.hourlyRate == null ? null : convertMoneyNumber(project.hourlyRate, conversionRate),
          fixedBudget: project.fixedBudget == null ? null : convertMoneyNumber(project.fixedBudget, conversionRate),
        })),
      })));

      setSessions((prev) => prev.map((session) => ({
        ...session,
        rate: convertMoneyNumber(session.rate, conversionRate),
        earned: convertMoneyNumber(session.earned, conversionRate),
        fixedAmount: convertMoneyNumber(session.fixedAmount, conversionRate),
      })));

      setProfileCurrency(normalizedNextCurrency);
      setSyncError("");
    } catch (error) {
      const message = error instanceof Error ? error.message : t("app.errors.currencyUnknown");
      setSyncError(t("app.errors.currencyFailed", { message }));
    } finally {
      setIsCurrencyConverting(false);
    }
  }

  useEffect(() => {
    function onKeyDown(event) {
      if (event.code !== "Space") return;
      if (!(event.target instanceof HTMLElement)) return;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName)) return;

      event.preventDefault();

      if (running) {
        if (paused) {
          timerStartedAtRef.current = Date.now();
          setPaused(false);
          return;
        }
        const finalElapsed = getElapsedNow();
        setRunning(false);
        setPaused(false);
        setSessions((prev) => prev.map((session) => (
          session.id === activeSessionId
            ? {
                ...session,
                duration: finalElapsed,
                earned: calculateSessionEarned(finalElapsed, session),
                status: "DONE",
              }
            : session
        )));
        setActiveSessionId(null);
        timerStartedAtRef.current = null;
        elapsedBeforeRunRef.current = 0;
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
      elapsedBeforeRunRef.current = 0;
      timerStartedAtRef.current = Date.now();
      setPaused(false);
      setRunning(true);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [running, paused, activeSessionId, elapsed, taskName, taskNotes, taskRate, profileHourlyRate, taskBillingType, taskDateTime, resolvedActiveClientId, activeProjectId, calculateSessionEarned, resolveTaskRate]);

  function startPendingSession(session) {
    if (running) return;

    if ((session.billingType || "hourly") !== "hourly") {
      setSessions((prev) => prev.map((item) => (item.id === session.id ? { ...item, status: "DONE" } : item)));
      return;
    }

    setActiveSessionId(session.id);
    setElapsed(session.duration);
    elapsedBeforeRunRef.current = session.duration;
    timerStartedAtRef.current = Date.now();
    setPaused(false);
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
      const formattedBillingValue = billingType === "hourly"
        ? `${profileCurrency} ${session.rate}/hr`
        : `${profileCurrency} ${parseFloat(session.fixedAmount || 0).toFixed(2)} fixed`;
      return [
        formatDate(session.ts),
        activeClient?.name || "",
        project?.name || "",
        `"${session.name}"`,
        `"${session.notes || ""}"`,
        (session.duration / 3600).toFixed(2),
        billingTypeLabel,
        formattedBillingValue,
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
    if (unpaidDoneSessions.length === 0) return;

    const projectName = activeProjectId !== "all" ? activeProjects.find((item) => item.id === activeProjectId)?.name : null;
    const currency = profileCurrency;
    const invoiceDate = new Date();
    const invoiceDateLabel = invoiceDate.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
    const invoiceId = `INV-${invoiceDate.getTime().toString().slice(-6)}`;
    const serviceBrand = "LOGR";
    const serviceDomain = "logr.app";

    const countedProjects = new Set();
    const rows = unpaidDoneSessions
      .map((session) => {
        const project = activeProjects.find((item) => item.id === session.projectId);
        const billingType = session.billingType || "hourly";
        const billingLabel = billingType === "hourly"
          ? `${currency} ${session.rate}/hr`
          : `${currency} ${parseFloat(session.fixedAmount || session.earned || 0).toFixed(2)} fixed`;
        let billedAmount = parseFloat(session.earned || 0);
        if (billingType === "fixed_project") {
          if (session.projectId && !countedProjects.has(session.projectId)) {
            billedAmount = parseFloat(session.fixedAmount || 0);
            countedProjects.add(session.projectId);
          } else {
            billedAmount = 0;
          }
        }
        return `<tr><td>${formatDate(session.ts)}</td><td>${session.name}${project ? ` <span style="color:#999;font-size:11px">[${project.name}]</span>` : ""}${session.notes ? `<br><span style="color:#999;font-size:11px">${session.notes}</span>` : ""}</td><td>${(session.duration / 3600).toFixed(2)}h</td><td>${billingLabel}</td><td><strong>${formatMoney(billedAmount, currency)}</strong></td></tr>`;
      })
      .join("");

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Invoice — ${activeClient?.name}</title>
    <style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Inter Tight',Arial,sans-serif;padding:60px;color:#111}.brand-row{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px}.brand-mark{font-size:12px;color:#999;letter-spacing:.22em;text-transform:uppercase;margin-bottom:4px}.brand-name{font-size:22px;letter-spacing:.04em;font-weight:600}.brand-site{font-size:11px;color:#999}h1{font-family:'Inter Tight',sans-serif;font-size:48px;letter-spacing:-.02em;margin-bottom:4px;font-weight:400}.sub{font-size:11px;color:#999;letter-spacing:.2em;text-transform:uppercase;margin-bottom:40px}.meta{display:flex;justify-content:space-between;margin-bottom:40px;font-size:13px}.lbl{font-size:9px;color:#999;letter-spacing:.15em;text-transform:uppercase;margin-bottom:4px}table{width:100%;border-collapse:collapse;margin-bottom:32px}th{font-size:9px;color:#999;letter-spacing:.15em;text-transform:uppercase;text-align:left;padding:8px 0;border-bottom:2px solid #111}td{padding:10px 0;border-bottom:1px solid #eee;font-size:13px}.total{text-align:right;font-size:24px;font-family:'Inter Tight',sans-serif}.total .lbl{margin-bottom:4px}</style>
    </head><body>
    <div class="brand-row"><div><div class="brand-mark">Service</div><div class="brand-name">${serviceBrand}</div><div class="brand-site">${serviceDomain}</div></div></div>
    <h1>INVOICE</h1><div class="sub">${serviceBrand}</div>
    <div class="meta">
      <div><div class="lbl">Client</div><div style="font-size:16px;font-weight:bold">${activeClient?.name}</div>${projectName ? `<div class="lbl" style="margin-top:8px">Project</div><div>${projectName}</div>` : ""}</div>
      <div style="text-align:right"><div class="lbl">Date</div><div>${invoiceDateLabel}</div><div class="lbl" style="margin-top:8px">Invoice #</div><div>${invoiceId}</div></div>
    </div>
    <table><thead><tr><th>Date</th><th>Task</th><th>Hours</th><th>Rate</th><th>Amount</th></tr></thead><tbody>${rows}</tbody></table>
    <div class="total"><div class="lbl">Total Due</div>${formatMoney(unpaidTotal, currency)}</div>
    <script>window.onload=()=>window.print();</script></body></html>`;

    const popup = window.open("", "_blank");
    popup.document.write(html);
    popup.document.close();
  }

  function closeTour(markCompleted) {
    setShowTour(false);
    if (!markCompleted) return;
    try {
      window.localStorage.setItem(ONBOARDING_CACHE_KEY, "1");
    } catch {}
  }

  function openTour() {
    setScreen("tracker");
    setMobileView("main");
    setTourStep(0);
    setShowTour(true);
  }

  function createFirstTaskFromTour() {
    const hasDoneSessions = sessions.some((session) => session.status === "DONE");
    if (!hasDoneSessions) {
      let nextClientId = resolvedActiveClientId;

      if (!nextClientId) {
        const firstClient = { id: uid(), name: t("app.firstClientName"), projects: [] };
        nextClientId = firstClient.id;
        setClients((prev) => [...prev, firstClient]);
        setActiveClientId(firstClient.id);
        setActiveProjectId("all");
      }

      const profileRate = parseFloat(profileHourlyRate || 0);
      const rate = Number.isFinite(profileRate) && profileRate > 0 ? parseFloat(profileRate.toFixed(2)) : 50;
      const duration = 3600;
      const workdayHours = parseFloat(profileWorkdayHours || 8);
      const normalizedWorkdayHours = Number.isFinite(workdayHours) && workdayHours > 0 ? workdayHours : 8;

      setSessions((prev) => [
        {
          id: uid(),
          clientId: nextClientId,
          projectId: null,
          name: t("app.kickoffTaskName"),
          notes: t("app.kickoffTaskNotes"),
          duration,
          days: 0,
          hours: 1,
          minutes: 0,
          workdayHours: normalizedWorkdayHours,
          earned: earnedFromDuration(duration, rate),
          rate,
          billingType: "hourly",
          fixedAmount: 0,
          paymentStatus: "UNPAID",
          ts: Date.now(),
          status: "DONE",
        },
        ...prev,
      ]);
    }

    closeTour(true);
    setScreen("dashboard");
    setMobileView("main");
  }

  // ── CRM handlers ─────────────────────────────────────────────────────────

  async function handleProfileSaved(data) {
    setClientProfiles((prev) => {
      const idx = prev.findIndex((p) => p.client_id === data.client_id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = data;
        return next;
      }
      return [...prev, data];
    });
  }

  async function handleCreateFunnel(type) {
    if (!user) return { error: new Error("Not signed in") };
    const { data, error } = await createFunnelWithStages(user.id, { type });
    if (!error && data) {
      setFunnels((prev) => [...prev, data]);
      setActiveFunnelId(data.id);
    }
    return { data, error };
  }

  async function handleUpdateFunnelStages(funnelId, stages) {
    const updates = stages.map((stage) =>
      updateFunnelStage(stage.id, { title: stage.title, position: stage.position })
    );
    const results = await Promise.all(updates);
    const firstError = results.find((result) => result.error)?.error || null;
    if (firstError) return { error: firstError };

    setFunnels((prev) => prev.map((funnel) => (
      funnel.id === funnelId
        ? { ...funnel, stages: stages.slice().sort((a, b) => a.position - b.position) }
        : funnel
    )));

    return { error: null };
  }

  async function handleDeleteFunnel(funnelId) {
    const { error } = await deleteFunnelWithLeads(funnelId);
    if (error) return { error };

    setLeads((prev) => prev.filter((lead) => lead.funnel_id !== funnelId));
    setFunnels((prev) => prev.filter((funnel) => funnel.id !== funnelId));
    return { error: null };
  }

  async function handleCreateLead(leadData) {
    if (!user || !activeFunnel || !activeFunnel.stages?.length) return;
    const stageMap = activeFunnel.stages.reduce((acc, stage) => ({ ...acc, [stage.id]: stage }), {});
    const fallbackStage = activeFunnel.stages[0];
    const stageId = leadData.stage_id || fallbackStage.id;
    const stage = stageMap[stageId] || fallbackStage;
    const { data, error } = await createLead(user.id, {
      ...leadData,
      funnel_id: activeFunnel.id,
      stage_id: stage.id,
      stage: stage.key,
    });
    if (!error && data) setLeads((prev) => [...prev, data]);
    return { data, error };
  }

  async function handleUpdateLead(leadId, updates) {
    let normalizedUpdates = updates;
    if (updates.stage_id && activeFunnel?.stages?.length) {
      const matchedStage = activeFunnel.stages.find((stage) => stage.id === updates.stage_id);
      if (matchedStage) {
        normalizedUpdates = { ...updates, stage: matchedStage.key };
      }
    }
    const { data, error } = await updateLead(leadId, normalizedUpdates);
    if (!error && data) setLeads((prev) => prev.map((l) => (l.id === leadId ? data : l)));
    return { data, error };
  }

  async function handleDeleteLead(leadId) {
    const { error } = await deleteLead(leadId);
    if (!error) setLeads((prev) => prev.filter((l) => l.id !== leadId));
    return { error };
  }

  async function handleCreateInvoice(invoiceData) {
    if (!user) return { error: new Error("Not signed in") };
    const { data, error } = await createInvoice(user.id, invoiceData);
    if (!error && data) setInvoices((prev) => [data, ...prev]);
    return { data, error };
  }

  async function handleUpdateInvoice(invoiceId, updates) {
    const { data, error } = await updateInvoice(invoiceId, updates);
    if (!error && data) setInvoices((prev) => prev.map((inv) => (inv.id === invoiceId ? data : inv)));
    return { data, error };
  }

  async function handleDeleteInvoice(invoice) {
    const { error } = await deleteInvoice(invoice.id);
    if (!error) {
      setInvoices((prev) => prev.filter((inv) => inv.id !== invoice.id));
      if (invoice.session_ids?.length > 0) {
        handleUpdateSessionsPayment(invoice.session_ids, "UNPAID");
      }
    }
    return { error };
  }

  function handleUpdateSessionsPayment(sessionIds, paymentStatus) {
    setSessions((prev) =>
      prev.map((s) => (sessionIds.includes(s.id) ? { ...s, paymentStatus } : s))
    );
  }

  if (!isSupabaseConfigured()) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, fontFamily: "'Inter Tight',sans-serif" }}>
        <div style={{ width: "100%", maxWidth: 620, border: "1px solid #ddd", padding: 24, borderRadius: 12 }}>
          <h1 style={{ fontSize: 20, marginBottom: 12 }}>{t("app.noSupabase")}</h1>
          <p style={{ opacity: 0.8, marginBottom: 8 }}>{t("app.addEnv")}</p>
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
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", fontFamily: "'Inter Tight',sans-serif" }}>
        <div>{t("app.checkingSession")}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, fontFamily: "'Inter Tight',sans-serif", background: theme.bg, color: theme.text }}>
        <div style={{ width: "100%", maxWidth: 520, border: `1px solid ${theme.border}`, borderRadius: 16, padding: 24, background: theme.statBg }}>
          <h1 style={{ fontFamily: "'Inter Tight',sans-serif", fontSize: 32, fontWeight: 400, marginBottom: 8 }}>Logr</h1>
          <p style={{ marginBottom: 20, color: theme.muted }}>{t("app.signInToSync")}</p>
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
            {t("app.continueWithGoogle")}
          </button>
          {errors.auth ? <p style={{ marginTop: 10, color: "#cc2222" }}>{errors.auth}</p> : null}
        </div>
      </div>
    );
  }

  if (!syncReady) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", fontFamily: "'Inter Tight',sans-serif" }}>
        <div>{t("app.loadingWorkspace")}</div>
      </div>
    );
  }

  return (
    <div className="logr-app" style={{ minHeight: "100vh", background: theme.bg, color: theme.text, fontFamily: "'Inter Tight',sans-serif", transition: "background 0.2s" }}>
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
            setScreen("clients");
            setMobileView("main");
          }}
          onRemoveClient={removeClient}
          onRenameClient={renameClient}
          onSelectScreen={(nextScreen) => {
            setScreen(nextScreen);
            if (nextScreen !== "tracker" && nextScreen !== "clients") {
              setMobileView("main");
            }
          }}
          onToggleTheme={() => setDark((value) => !value)}
          onOpenOnboarding={openTour}
        />

        <div className="main-area" style={{ flex: 1, padding: "32px" }}>
          <div className="mobile-bar" style={{ height: 52 }} />

          {screen === "dashboard" ? (
            <SummaryDashboard theme={theme} currency={profileCurrency} clients={clients} sessions={sessions} targetHourlyRate={parseFloat(profileHourlyRate || 50)} />
          ) : screen === "profile" ? (
            <ProfileSettings
              theme={theme}
              user={user}
              syncError={syncError}
              onSignOut={signOut}
              currency={profileCurrency}
              onChangeCurrency={changeCurrency}
              isCurrencyConverting={isCurrencyConverting}
              hourlyRate={profileHourlyRate}
              setHourlyRate={setProfileHourlyRate}
              workdayHours={profileWorkdayHours}
              setWorkdayHours={setProfileWorkdayHours}
              requireProjectForFixed={profileRequireProjectForFixed}
              setRequireProjectForFixed={setProfileRequireProjectForFixed}
              language={profileLanguage}
              setLanguage={handleSetLanguage}
            />
          ) : screen === "clients" ? (
            crmLoading ? (
              <div style={{ color: theme.muted, fontSize: 12, letterSpacing: "0.1em" }}>...</div>
            ) : activeClient ? (
              <ClientCard
                theme={theme}
                client={activeClient}
                clientProfile={clientProfiles.find((p) => p.client_id === activeClient.id) || null}
                sessions={sessions}
                user={user}
                currency={profileCurrency}
                onProfileSaved={handleProfileSaved}
              />
            ) : (
              <WelcomeState theme={theme} />
            )
          ) : screen === "pipeline" ? (
            crmLoading ? (
              <div style={{ color: theme.muted, fontSize: 12, letterSpacing: "0.1em" }}>...</div>
            ) : (
              <Pipeline
                theme={theme}
                funnels={funnels}
                activeFunnelId={activeFunnel?.id || null}
                leads={leads}
                onSelectFunnel={setActiveFunnelId}
                onCreateFunnel={handleCreateFunnel}
                onDeleteFunnel={handleDeleteFunnel}
                onUpdateFunnelStages={handleUpdateFunnelStages}
                onCreateLead={handleCreateLead}
                onUpdateLead={handleUpdateLead}
                onDeleteLead={handleDeleteLead}
              />
            )
          ) : screen === "invoices" ? (
            crmLoading ? (
              <div style={{ color: theme.muted, fontSize: 12, letterSpacing: "0.1em" }}>...</div>
            ) : (
              <InvoicesList
                theme={theme}
                invoices={invoices}
                clients={clients}
                sessions={sessions}
                currency={profileCurrency}
                onCreateInvoice={handleCreateInvoice}
                onUpdateInvoice={handleUpdateInvoice}
                onDeleteInvoice={handleDeleteInvoice}
                onUpdateSessions={handleUpdateSessionsPayment}
              />
            )
          ) : !activeClient ? (
            <WelcomeState theme={theme} />
          ) : (
            <>
              <TimerHeader theme={theme} activeClient={activeClient} activeTimedSession={activeTimedSession} elapsed={elapsed} running={running} paused={paused} />

              <ProjectAndDateFilters
                theme={theme}
                currency={profileCurrency}
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
                currency={profileCurrency}
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
                paused={paused}
                onPause={pauseTimer}
                onResume={resumeTimer}
                onStop={stopTimer}
                errors={errors}
              />

              <StatsAndExports
                theme={theme}
                currency={profileCurrency}
                doneSessions={doneSessions}
                totalHours={totalHours}
                totalEarned={totalEarned}
                paidTotal={paidTotal}
                unpaidTotal={unpaidTotal}
                collectionRate={collectionRate}
                hasUnpaidSessions={unpaidDoneSessions.length > 0}
                onExportCsv={exportCsv}
                onExportInvoicePdf={exportInvoicePdf}
              />

              <SessionsList
                theme={theme}
                currency={profileCurrency}
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
      {showTour ? (
        <GuidedTour
          theme={theme}
          steps={tourSteps}
          stepIndex={tourStep}
          canCreateFirstTask={doneSessions.length === 0}
          onCreateFirstTask={createFirstTaskFromTour}
          onBack={() => setTourStep((prev) => Math.max(prev - 1, 0))}
          onNext={() => setTourStep((prev) => Math.min(prev + 1, tourSteps.length - 1))}
          onClose={() => closeTour(true)}
          onFinish={() => closeTour(true)}
        />
      ) : null}
    </div>
  );
}
