import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./auth-context";
import {
  settingsApi, clientsApi, projectsApi, sessionsApi,
  invoicesApi, invoiceItemsApi, activitiesApi,
} from "./api";
import type {
  UserSettings, Client, Project, Session, Invoice, InvoiceItem,
  Activity,
  ClientInsert, ClientUpdate, ProjectInsert, ProjectUpdate,
  SessionInsert, SessionUpdate, InvoiceInsert, InvoiceUpdate,
  InvoiceItemInsert, ActivityInsert, UserSettingsUpdate,
} from "@/types/database";

const TIMER_KEY = "logr.timer";

interface PersistedTimer {
  running: boolean;
  startedAt: number | null;
  paused: boolean;
  pausedElapsed: number;
  description: string;
}

function readPersistedTimer(): PersistedTimer | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(TIMER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PersistedTimer>;
    return {
      running: Boolean(parsed.running),
      startedAt: typeof parsed.startedAt === "number" ? parsed.startedAt : null,
      paused: Boolean(parsed.paused),
      pausedElapsed: typeof parsed.pausedElapsed === "number" ? parsed.pausedElapsed : 0,
      description: typeof parsed.description === "string" ? parsed.description : "",
    };
  } catch {
    return null;
  }
}

export function useData() {
  const { user } = useAuth();
  const userId = user?.id || "";

  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoiceItems, setInvoiceItems] = useState<Map<string, InvoiceItem[]>>(new Map());
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // ── Load all data ──
  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setLoadError(null);
    try {
      const [s, cl, pr, se, inv, act] = await Promise.all([
        settingsApi.get(),
        clientsApi.list(),
        projectsApi.list(),
        sessionsApi.list(),
        invoicesApi.list(),
        activitiesApi.list(),
      ]);
      setSettings(s);
      setClients(cl);
      setProjects(pr);
      setSessions(se);
      setInvoices(inv);
      setActivities(act);
    } catch (err) {
      console.error("Failed to load data:", err);
      setLoadError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    // Fetch-on-mount and on user change. `load` syncs loading/error state —
    // a legitimate external-data sync, not a render-driven cascade.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const reload = useCallback(() => { void load(); }, [load]);

  // ── Settings ──
  const updateSettings = useCallback(async (data: UserSettingsUpdate) => {
    const updated = await settingsApi.upsert(userId, data);
    setSettings(updated);
    return updated;
  }, [userId]);

  // ── Clients ──
  const addClient = useCallback(async (data: Omit<ClientInsert, "user_id">) => {
    const created = await clientsApi.create({ ...data, user_id: userId });
    setClients((prev) => [created, ...prev]);
    return created;
  }, [userId]);

  const updateClient = useCallback(async (id: string, data: ClientUpdate) => {
    const updated = await clientsApi.update(id, data);
    setClients((prev) => prev.map((c) => (c.id === id ? updated : c)));
    return updated;
  }, []);

  const deleteClient = useCallback(async (id: string) => {
    await clientsApi.delete(id);
    setClients((prev) => prev.filter((c) => c.id !== id));
  }, []);

  // ── Projects ──
  const addProject = useCallback(async (data: Omit<ProjectInsert, "user_id">) => {
    const created = await projectsApi.create({ ...data, user_id: userId });
    setProjects((prev) => [created, ...prev]);
    return created;
  }, [userId]);

  const updateProject = useCallback(async (id: string, data: ProjectUpdate) => {
    const updated = await projectsApi.update(id, data);
    setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
    return updated;
  }, []);

  const deleteProject = useCallback(async (id: string) => {
    await projectsApi.delete(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // ── Sessions (time entries) ──
  const addSession = useCallback(async (data: Omit<SessionInsert, "user_id">) => {
    const created = await sessionsApi.create({ ...data, user_id: userId });
    setSessions((prev) => [created, ...prev]);
    return created;
  }, [userId]);

  const addSessionsBulk = useCallback(async (rows: Omit<SessionInsert, "user_id">[]) => {
    const withUser = rows.map((r) => ({ ...r, user_id: userId }));
    const created = await sessionsApi.createMany(withUser);
    // Prepend the created rows to local state so widgets update immediately
    // without requiring a full reload (which would re-fetch all tables).
    setSessions((prev) => [...created, ...prev]);
    return created;
  }, [userId]);

  const updateSession = useCallback(async (id: string, data: SessionUpdate) => {
    const updated = await sessionsApi.update(id, data);
    setSessions((prev) => prev.map((s) => (s.id === id ? updated : s)));
    return updated;
  }, []);

  const deleteSession = useCallback(async (id: string) => {
    await sessionsApi.delete(id);
    setSessions((prev) => prev.filter((s) => s.id !== id));
  }, []);

  // ── Invoices ──
  const addInvoice = useCallback(async (data: Omit<InvoiceInsert, "user_id">, items: Omit<InvoiceItemInsert, "invoice_id">[]) => {
    const created = await invoicesApi.create({ ...data, user_id: userId });
    if (items.length > 0) {
      const createdItems = await invoiceItemsApi.createMany(
        items.map((i) => ({ ...i, invoice_id: created.id }))
      );
      setInvoiceItems((prev) => new Map(prev).set(created.id, createdItems));
    }
    setInvoices((prev) => [created, ...prev]);
    return created;
  }, [userId]);

  const updateInvoice = useCallback(async (id: string, data: InvoiceUpdate) => {
    const updated = await invoicesApi.update(id, data);
    setInvoices((prev) => prev.map((i) => (i.id === id ? updated : i)));
    return updated;
  }, []);

  const updateInvoiceWithItems = useCallback(async (id: string, data: InvoiceUpdate, items: Omit<InvoiceItemInsert, "invoice_id">[]) => {
    const updated = await invoicesApi.update(id, data);
    await invoiceItemsApi.deleteByInvoice(id);
    const createdItems = items.length > 0
      ? await invoiceItemsApi.createMany(items.map((i) => ({ ...i, invoice_id: id })))
      : [];
    setInvoices((prev) => prev.map((i) => (i.id === id ? updated : i)));
    setInvoiceItems((prev) => new Map(prev).set(id, createdItems));
    return updated;
  }, []);

  const deleteInvoice = useCallback(async (id: string) => {
    await invoicesApi.delete(id);
    setInvoices((prev) => prev.filter((i) => i.id !== id));
    setInvoiceItems((prev) => { const m = new Map(prev); m.delete(id); return m; });
  }, []);

  const getInvoiceItems = useCallback(async (invoiceId: string) => {
    const cached = invoiceItems.get(invoiceId);
    if (cached) return cached;
    const items = await invoiceItemsApi.listByInvoice(invoiceId);
    setInvoiceItems((prev) => new Map(prev).set(invoiceId, items));
    return items;
  }, [invoiceItems]);

  // ── Activities ──
  const addActivity = useCallback(async (data: Omit<ActivityInsert, "user_id">) => {
    const created = await activitiesApi.create({ ...data, user_id: userId });
    setActivities((prev) => [created, ...prev]);
    return created;
  }, [userId]);

  // ── Lookups ──
  const getProjectById = useCallback((id: string | null) => projects.find((p) => p.id === id), [projects]);
  const getClientById = useCallback((id: string | null) => clients.find((c) => c.id === id), [clients]);

  // ── Timer (local state, persisted to localStorage so it survives reloads) ──
  const [timerRunning, setTimerRunning] = useState(() => readPersistedTimer()?.running ?? false);
  const [timerSeconds, setTimerSeconds] = useState(() => {
    const t = readPersistedTimer();
    // timerSeconds is derived from startedAt; restore an estimate if running.
    if (t?.running && t.startedAt != null) {
      return t.pausedElapsed + Math.floor((Date.now() - t.startedAt) / 1000);
    }
    return 0;
  });
  const [timerPaused, setTimerPaused] = useState(() => readPersistedTimer()?.paused ?? false);
  const [timerStartedAt, setTimerStartedAt] = useState<number | null>(() => readPersistedTimer()?.startedAt ?? null);
  const [timerPausedElapsed, setTimerPausedElapsed] = useState(() => readPersistedTimer()?.pausedElapsed ?? 0);
  const [timerDescription, setTimerDescription] = useState(() => readPersistedTimer()?.description ?? "");

  // Sync the persisted timer blob whenever any persisted field changes.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      // Idle/reset: nothing running and no started_at — clear so it can't resurrect.
      if (!timerRunning && timerStartedAt == null) {
        window.localStorage.removeItem(TIMER_KEY);
        return;
      }
      const blob: PersistedTimer = {
        running: timerRunning,
        startedAt: timerStartedAt,
        paused: timerPaused,
        pausedElapsed: timerPausedElapsed,
        description: timerDescription,
      };
      window.localStorage.setItem(TIMER_KEY, JSON.stringify(blob));
    } catch {
      // localStorage may throw (private mode / quota) — ignore.
    }
  }, [timerRunning, timerStartedAt, timerPaused, timerPausedElapsed, timerDescription]);

  return {
    loading, loadError, reload, userId,
    settings, updateSettings,
    clients, addClient, updateClient, deleteClient, getClientById,
    projects, addProject, updateProject, deleteProject, getProjectById,
    sessions, addSession, addSessionsBulk, updateSession, deleteSession,
    invoices, addInvoice, updateInvoice, updateInvoiceWithItems, deleteInvoice, getInvoiceItems,
    activities, addActivity,
    timerRunning, setTimerRunning, timerSeconds, setTimerSeconds,
    timerPaused, setTimerPaused, timerStartedAt, setTimerStartedAt,
    timerPausedElapsed, setTimerPausedElapsed,
    timerDescription, setTimerDescription,
  };
}
