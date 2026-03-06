import { useState } from "react";
import type { Project, Client, TimeEntry, Invoice, Settings, Funnel, FunnelStage, FunnelDeal } from "@/types";
import { DEFAULT_SETTINGS } from "@/types";

const PROJECT_COLORS = [
  "#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6",
  "#ec4899", "#06b6d4", "#f97316", "#6366f1", "#14b8a6",
];

function getNextColor(existing: Project[]): string {
  return PROJECT_COLORS[existing.length % PROJECT_COLORS.length];
}

let invoiceCounter = 0;
function nextInvoiceNumber(): string {
  invoiceCounter++;
  return `INV-${String(invoiceCounter).padStart(4, "0")}`;
}

export function useStore() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [settings, setSettings] = useState<Settings>({ ...DEFAULT_SETTINGS });

  // Funnels
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [deals, setDeals] = useState<FunnelDeal[]>([]);

  const addFunnel = (data: { name: string; stages: { name: string; color: string }[] }) => {
    const funnel: Funnel = {
      id: crypto.randomUUID(),
      name: data.name,
      stages: data.stages.map((s, i) => ({ ...s, id: crypto.randomUUID(), order: i })),
      createdAt: new Date(),
    };
    setFunnels((prev) => [funnel, ...prev]);
    return funnel;
  };

  const updateFunnel = (id: string, data: Partial<Funnel>) => {
    setFunnels((prev) => prev.map((f) => (f.id === id ? { ...f, ...data } : f)));
  };

  const deleteFunnel = (id: string) => {
    setFunnels((prev) => prev.filter((f) => f.id !== id));
    setDeals((prev) => prev.filter((d) => d.funnelId !== id));
  };

  const addDeal = (data: Omit<FunnelDeal, "id" | "createdAt" | "updatedAt">) => {
    const deal: FunnelDeal = { ...data, id: crypto.randomUUID(), createdAt: new Date(), updatedAt: new Date() };
    setDeals((prev) => [deal, ...prev]);
    return deal;
  };

  const updateDeal = (id: string, data: Partial<FunnelDeal>) => {
    setDeals((prev) => prev.map((d) => (d.id === id ? { ...d, ...data, updatedAt: new Date() } : d)));
  };

  const deleteDeal = (id: string) => {
    setDeals((prev) => prev.filter((d) => d.id !== id));
  };

  const moveDeal = (id: string, stageId: string) => {
    setDeals((prev) => prev.map((d) => (d.id === id ? { ...d, stageId, updatedAt: new Date() } : d)));
  };

  // Timer state (shared for dashboard indicator)
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerDescription, setTimerDescription] = useState("");

  // Projects
  const addProject = (data: Omit<Project, "id" | "createdAt" | "color" | "status" | "budgetHours" | "notes"> & Partial<Pick<Project, "color" | "status" | "budgetHours" | "notes">>) => {
    const project: Project = {
      ...data,
      id: crypto.randomUUID(),
      color: data.color || getNextColor(projects),
      status: data.status || "active",
      budgetHours: data.budgetHours ?? null,
      notes: data.notes || "",
      createdAt: new Date(),
    };
    setProjects((prev) => [project, ...prev]);
    return project;
  };

  const updateProject = (id: string, data: Partial<Project>) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
  };

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  // Clients
  const addClient = (data: Omit<Client, "id" | "createdAt" | "status" | "phone" | "address" | "notes"> & Partial<Pick<Client, "status" | "phone" | "address" | "notes">>) => {
    const client: Client = {
      ...data,
      id: crypto.randomUUID(),
      phone: data.phone || "",
      address: data.address || "",
      notes: data.notes || "",
      status: data.status || "active",
      createdAt: new Date(),
    };
    setClients((prev) => [client, ...prev]);
    return client;
  };

  const updateClient = (id: string, data: Partial<Client>) => {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
  };

  const deleteClient = (id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
  };

  // Time entries
  const addEntry = (data: Omit<TimeEntry, "id">) => {
    const entry: TimeEntry = { ...data, billable: data.billable ?? true, id: crypto.randomUUID() };
    setEntries((prev) => [entry, ...prev]);
    return entry;
  };

  const updateEntry = (id: string, data: Partial<TimeEntry>) => {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...data } : e)));
  };

  const deleteEntry = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  // Invoices
  const addInvoice = (data: Omit<Invoice, "id" | "number" | "createdAt" | "paidAt" | "taxRate" | "discount"> & Partial<Pick<Invoice, "taxRate" | "discount">>) => {
    const invoice: Invoice = {
      ...data,
      id: crypto.randomUUID(),
      number: nextInvoiceNumber(),
      taxRate: data.taxRate ?? 0,
      discount: data.discount ?? 0,
      paidAt: null,
      createdAt: new Date(),
    };
    setInvoices((prev) => [invoice, ...prev]);
    return invoice;
  };

  const updateInvoice = (id: string, data: Partial<Invoice>) => {
    setInvoices((prev) => prev.map((i) => (i.id === id ? { ...i, ...data } : i)));
  };

  const deleteInvoice = (id: string) => {
    setInvoices((prev) => prev.filter((i) => i.id !== id));
  };

  // Settings
  const updateSettings = (data: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...data }));
  };

  // Lookups
  const getProjectById = (id: string | null) => projects.find((p) => p.id === id);
  const getClientById = (id: string | null) => clients.find((c) => c.id === id);

  return {
    projects, addProject, updateProject, deleteProject, getProjectById,
    clients, addClient, updateClient, deleteClient, getClientById,
    entries, addEntry, updateEntry, deleteEntry,
    invoices, addInvoice, updateInvoice, deleteInvoice,
    settings, updateSettings,
    funnels, addFunnel, updateFunnel, deleteFunnel, deals, addDeal, updateDeal, deleteDeal, moveDeal,
    timerRunning, setTimerRunning, timerSeconds, setTimerSeconds, timerDescription, setTimerDescription,
  };
}
