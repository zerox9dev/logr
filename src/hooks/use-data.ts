import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useTimer } from "@/hooks/use-timer";
import {
  settingsApi, clientsApi, projectsApi, sessionsApi,
  invoicesApi, invoiceItemsApi, activitiesApi,
} from "@/api";
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
  const [billedSessionIds, setBilledSessionIds] = useState<Set<string>>(new Set());
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // ── Load all data ──
  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setLoadError(null);
    try {
      const [s, cl, pr, se, inv, billed, act] = await Promise.all([
        settingsApi.get(),
        clientsApi.list(),
        projectsApi.list(),
        sessionsApi.list(),
        invoicesApi.list(),
        invoiceItemsApi.listBilledSessionIds(),
        activitiesApi.list(),
      ]);
      setSettings(s);
      setClients(cl);
      setProjects(pr);
      setSessions(se);
      setInvoices(inv);
      setBilledSessionIds(new Set(billed));
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
      // Mark the just-billed sessions so they drop out of "unbilled" lists.
      setBilledSessionIds((prev) => {
        const next = new Set(prev);
        for (const i of createdItems) if (i.session_id) next.add(i.session_id);
        return next;
      });
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
    const items = invoiceItems.get(id);
    await invoicesApi.delete(id);
    setInvoices((prev) => prev.filter((i) => i.id !== id));
    setInvoiceItems((prev) => { const m = new Map(prev); m.delete(id); return m; });
    // Release the invoice's sessions back into "unbilled" (when we have the items cached).
    if (items?.length) {
      setBilledSessionIds((prev) => {
        const next = new Set(prev);
        for (const i of items) if (i.session_id) next.delete(i.session_id);
        return next;
      });
    }
  }, [invoiceItems]);

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

  // ── Timer (persisted to localStorage so it survives reloads) ──
  const timer = useTimer();

  return {
    loading, loadError, reload, userId,
    settings, updateSettings,
    clients, addClient, updateClient, deleteClient, getClientById,
    projects, addProject, updateProject, deleteProject, getProjectById,
    sessions, addSession, addSessionsBulk, updateSession, deleteSession,
    invoices, addInvoice, updateInvoice, updateInvoiceWithItems, deleteInvoice, getInvoiceItems, billedSessionIds,
    activities, addActivity,
    ...timer,
  };
}
