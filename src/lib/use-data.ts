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

  // ── Load all data ──
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    async function load() {
      try {
        const [s, cl, pr, se, inv, act] = await Promise.all([
          settingsApi.get(),
          clientsApi.list(),
          projectsApi.list(),
          sessionsApi.list(),
          invoicesApi.list(),
          activitiesApi.list(),
        ]);
        if (cancelled) return;
        setSettings(s);
        setClients(cl);
        setProjects(pr);
        setSessions(se);
        setInvoices(inv);
        setActivities(act);
      } catch (err) {
        console.error("Failed to load data:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [userId]);

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

  // ── Timer (local state, not persisted until save) ──
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerPaused, setTimerPaused] = useState(false);
  const [timerStartedAt, setTimerStartedAt] = useState<number | null>(null);
  const [timerPausedElapsed, setTimerPausedElapsed] = useState(0);
  const [timerDescription, setTimerDescription] = useState("");

  return {
    loading, userId,
    settings, updateSettings,
    clients, addClient, updateClient, deleteClient, getClientById,
    projects, addProject, updateProject, deleteProject, getProjectById,
    sessions, addSession, updateSession, deleteSession,
    invoices, addInvoice, updateInvoice, updateInvoiceWithItems, deleteInvoice, getInvoiceItems,
    activities, addActivity,
    timerRunning, setTimerRunning, timerSeconds, setTimerSeconds,
    timerPaused, setTimerPaused, timerStartedAt, setTimerStartedAt,
    timerPausedElapsed, setTimerPausedElapsed,
    timerDescription, setTimerDescription,
  };
}
