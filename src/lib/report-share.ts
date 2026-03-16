import type { Client, Session } from "@/types/database";

export type ReportsRange = "week" | "month" | "all";

export interface ReportBreakdownItem {
  name: string;
  durationSeconds: number;
}

export interface SharedReportSessionItem {
  id: string;
  name: string;
  projectName: string;
  startedAt: string;
  durationSeconds: number;
  rate: number;
  amount: number;
  paymentStatus: "paid" | "unpaid";
  billingType: "hourly" | "fixed";
}

export interface SharedReportPayload {
  version: 1;
  range: ReportsRange;
  currency: string;
  clientId?: string;
  clientName?: string;
  totalSeconds: number;
  billableSeconds: number;
  billableAmount: number;
  paidAmount: number;
  generatedAt: string;
  sessions: SharedReportSessionItem[];
  topProjects: ReportBreakdownItem[];
  topClients: ReportBreakdownItem[];
}

interface CreateReportSummaryInput {
  sessions: Session[];
  clients: Client[];
  range: ReportsRange;
  defaultCurrency?: string | null;
  defaultRate?: number | null;
  clientId?: string | null;
  clientName?: string | null;
  getProjectById: (id: string | null) => {
    id: string;
    name: string;
    rate: number | null;
    client_id?: string | null;
    billing_type?: string;
    fixed_budget?: number | null;
  } | undefined;
  noProjectLabel?: string;
  noClientLabel?: string;
}

export function getRangeStart(range: ReportsRange, now = new Date()): Date | null {
  if (range === "all") return null;

  if (range === "month") {
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }

  const startDate = new Date(now);
  const day = startDate.getDay();
  startDate.setDate(startDate.getDate() - day + (day === 0 ? -6 : 1));
  startDate.setHours(0, 0, 0, 0);
  return startDate;
}

export function createReportSummary({
  sessions,
  clients,
  range,
  defaultCurrency,
  defaultRate,
  clientId,
  clientName,
  getProjectById,
  noProjectLabel = "No project",
  noClientLabel = "No client",
}: CreateReportSummaryInput): SharedReportPayload {
  const startDate = getRangeStart(range);
  const startStr = startDate?.toISOString() || "";
  const filteredByClient = clientId
    ? sessions.filter((session) => {
        if (session.client_id === clientId) return true;
        if (!session.project_id) return false;
        const project = getProjectById(session.project_id);
        return project?.client_id === clientId;
      })
    : sessions;
  const filtered = startStr ? filteredByClient.filter((session) => session.started_at >= startStr) : filteredByClient;

  const getRate = (session: Session) => {
    const sessionRate = Number(session.rate);
    if (sessionRate > 0) return sessionRate;

    if (session.project_id) {
      const project = getProjectById(session.project_id);
      if (project?.rate && project.rate > 0) return project.rate;
    }

    return Number(defaultRate) || 0;
  };

  const totalSeconds = filtered.reduce((sum, session) => sum + session.duration_seconds, 0);
  const billableSeconds = filtered
    .filter((session) => session.billing_type === "hourly")
    .reduce((sum, session) => sum + session.duration_seconds, 0);

  const hourlyEarnings = (onlyPaid: boolean) =>
    filtered.reduce((sum, session) => {
      if (session.billing_type !== "hourly") return sum;
      if (onlyPaid && session.payment_status !== "paid") return sum;

      const rate = getRate(session);
      if (rate <= 0) return sum;

      return sum + (session.duration_seconds / 3600) * rate;
    }, 0);

  const fixedProjectIds = new Set(
    filtered
      .filter((session) => session.project_id)
      .map((session) => session.project_id as string)
      .filter((projectId) => getProjectById(projectId)?.billing_type === "fixed")
  );

  const fixedEarnings = (onlyPaid: boolean) =>
    Array.from(fixedProjectIds).reduce((sum, projectId) => {
      const project = getProjectById(projectId);
      if (!project?.fixed_budget || project.fixed_budget <= 0) return sum;

      const projectSessions = filtered.filter((session) => session.project_id === projectId);
      if (projectSessions.length === 0) return sum;
      if (onlyPaid && !projectSessions.some((session) => session.payment_status === "paid")) return sum;

      return sum + project.fixed_budget;
    }, 0);

  const buildBreakdown = (
    getKey: (session: Session) => string,
    getName: (key: string) => string,
  ) => {
    const durationMap = new Map<string, number>();

    filtered.forEach((session) => {
      const key = getKey(session);
      durationMap.set(key, (durationMap.get(key) || 0) + session.duration_seconds);
    });

    return Array.from(durationMap.entries())
      .map(([key, durationSeconds]) => ({
        name: getName(key),
        durationSeconds,
      }))
      .sort((a, b) => b.durationSeconds - a.durationSeconds);
  };

  return {
    version: 1,
    range,
    currency: defaultCurrency || "USD",
    clientId: clientId || undefined,
    clientName: clientName || undefined,
    totalSeconds,
    billableSeconds,
    billableAmount: hourlyEarnings(false) + fixedEarnings(false),
    paidAmount: hourlyEarnings(true) + fixedEarnings(true),
    generatedAt: new Date().toISOString(),
    sessions: [...filtered]
      .sort((a, b) => b.started_at.localeCompare(a.started_at))
      .map((session) => {
        const rate = getRate(session);
        const project = session.project_id ? getProjectById(session.project_id) : undefined;
        const siblingSessions = session.project_id ? filtered.filter((item) => item.project_id === session.project_id) : [];
        const fixedAmountPerSession = session.billing_type === "fixed" && project?.fixed_budget
          ? project.fixed_budget / Math.max(siblingSessions.length, 1)
          : 0;
        const amount = session.billing_type === "hourly" && rate > 0
          ? (session.duration_seconds / 3600) * rate
          : fixedAmountPerSession;

        return {
          id: session.id,
          name: session.name || "Untitled session",
          projectName: session.project_id ? getProjectById(session.project_id)?.name || noProjectLabel : noProjectLabel,
          startedAt: session.started_at,
          durationSeconds: session.duration_seconds,
          rate,
          amount,
          paymentStatus: session.payment_status,
          billingType: session.billing_type,
        };
      }),
    topProjects: buildBreakdown(
      (session) => session.project_id || "__none__",
      (key) => (key === "__none__" ? noProjectLabel : getProjectById(key)?.name || noProjectLabel),
    ),
    topClients: buildBreakdown(
      (session) => session.client_id || "__none__",
      (key) => (key === "__none__" ? noClientLabel : clients.find((client) => client.id === key)?.name || noClientLabel),
    ),
  };
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function getCurrencySymbol(currency: string): string {
  return { USD: "$", EUR: "€", GBP: "£", UAH: "₴", PLN: "zł" }[currency] || "$";
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

export function encodeSharedReport(payload: SharedReportPayload): string {
  const json = JSON.stringify(payload);
  const bytes = new TextEncoder().encode(json);
  return bytesToBase64(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function decodeSharedReport(value: string): SharedReportPayload | null {
  try {
    const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const bytes = base64ToBytes(padded);
    const parsed = JSON.parse(new TextDecoder().decode(bytes)) as SharedReportPayload;
    if (parsed?.version !== 1) return null;
    return parsed;
  } catch {
    return null;
  }
}
