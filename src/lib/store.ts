import { useState } from "react";
import type { Project, Client, TimeEntry } from "@/types";

const PROJECT_COLORS = [
  "#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6",
  "#ec4899", "#06b6d4", "#f97316", "#6366f1", "#14b8a6",
];

function getNextColor(existing: Project[]): string {
  return PROJECT_COLORS[existing.length % PROJECT_COLORS.length];
}

export function useStore() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [entries, setEntries] = useState<TimeEntry[]>([]);

  const addProject = (data: Omit<Project, "id" | "createdAt" | "color">) => {
    const project: Project = {
      ...data,
      id: crypto.randomUUID(),
      color: getNextColor(projects),
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

  const addClient = (data: Omit<Client, "id" | "createdAt">) => {
    const client: Client = {
      ...data,
      id: crypto.randomUUID(),
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

  const addEntry = (data: Omit<TimeEntry, "id">) => {
    const entry: TimeEntry = { ...data, id: crypto.randomUUID() };
    setEntries((prev) => [entry, ...prev]);
    return entry;
  };

  const getProjectById = (id: string | null) => projects.find((p) => p.id === id);
  const getClientById = (id: string | null) => clients.find((c) => c.id === id);

  return {
    projects, addProject, updateProject, deleteProject, getProjectById,
    clients, addClient, updateClient, deleteClient, getClientById,
    entries, addEntry,
  };
}
