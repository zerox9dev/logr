import type { RecordModel } from "pocketbase";
import type {
  UserSettings, UserSettingsUpdate,
  Client, ClientInsert, ClientUpdate,
  Project, ProjectInsert, ProjectUpdate,
  Session, SessionInsert, SessionUpdate,
  Invoice, InvoiceInsert, InvoiceUpdate,
  InvoiceItem, InvoiceItemInsert, InvoiceItemUpdate,
  Activity, ActivityInsert,
  JiraConnection, JiraProjectMapping, JiraProjectMappingInput,
  BillingType, PaymentStatus, InvoiceStatus, ProjectStatus, ActivityType,
  ClientType, SalaryPeriod,
} from "@/types/database";

// Translation layer between PocketBase records and the row shapes the rest of
// the app is written against (src/types/database.ts). PocketBase names its
// relations `user`/`client`/`project`/`invoice`/`session` and keeps `created`/
// `updated` as meta fields; rows imported from the old Postgres database also
// carry `original_created_at`/`original_updated_at` holding their true
// timestamps, which take precedence over the import-time `created`/`updated`.

/** PocketBase serialises dates as "2024-01-31 09:00:00.000Z"; callers expect ISO. */
function toIso(value: unknown): string {
  if (typeof value !== "string" || value === "") return "";
  const normalised = value.includes("T") ? value : value.replace(" ", "T");
  const parsed = new Date(normalised);
  return Number.isNaN(parsed.getTime()) ? normalised : parsed.toISOString();
}

function toIsoOrNull(value: unknown): string | null {
  const iso = toIso(value);
  return iso === "" ? null : iso;
}

function createdAt(record: RecordModel): string {
  return toIso(record.original_created_at) || toIso(record.created);
}

function updatedAt(record: RecordModel): string {
  return toIso(record.original_updated_at) || toIso(record.updated);
}

function str(value: unknown): string | null {
  return typeof value === "string" && value !== "" ? value : null;
}

function num(value: unknown): number | null {
  return typeof value === "number" ? value : null;
}

function tags(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((t): t is string => typeof t === "string") : [];
}

/** Drops undefined keys so a partial update never blanks untouched fields. */
function defined<T extends Record<string, unknown>>(payload: T): Record<string, unknown> {
  return Object.fromEntries(Object.entries(payload).filter(([, v]) => v !== undefined));
}

// ── User settings ──

export function toUserSettingsRow(r: RecordModel): UserSettings {
  return {
    id: r.id,
    user_id: r.user as string,
    full_name: str(r.full_name),
    company: str(r.company),
    email: str(r.email),
    phone: str(r.phone),
    address: str(r.address),
    default_currency: (str(r.default_currency) ?? "USD"),
    default_rate: num(r.default_rate),
    logo_url: str(r.logo_url),
    weekly_goal_hours: num(r.weekly_goal_hours),
    created_at: createdAt(r),
    updated_at: updatedAt(r),
  };
}

export function fromUserSettings(userId: string, data: UserSettingsUpdate): Record<string, unknown> {
  return defined({
    user: userId,
    full_name: data.full_name,
    company: data.company,
    email: data.email,
    phone: data.phone,
    address: data.address,
    default_currency: data.default_currency,
    default_rate: data.default_rate,
    logo_url: data.logo_url,
    weekly_goal_hours: data.weekly_goal_hours,
  });
}

// ── Clients ──

export function toClientRow(r: RecordModel): Client {
  return {
    id: r.id,
    user_id: r.user as string,
    name: (str(r.name) ?? ""),
    email: str(r.email),
    phone: str(r.phone),
    company: str(r.company),
    address: str(r.address),
    country: str(r.country),
    website: str(r.website),
    tags: tags(r.tags),
    notes: str(r.notes),
    client_type: (str(r.client_type) ?? "client") as ClientType,
    salary_amount: num(r.salary_amount),
    salary_period: str(r.salary_period) as SalaryPeriod | null,
    created_at: createdAt(r),
    updated_at: updatedAt(r),
  };
}

export function fromClient(data: ClientInsert | ClientUpdate): Record<string, unknown> {
  const insert = data as Partial<ClientInsert>;
  return defined({
    user: insert.user_id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    company: data.company,
    address: data.address,
    country: data.country,
    website: data.website,
    tags: data.tags,
    notes: data.notes,
    client_type: data.client_type,
    salary_amount: data.salary_amount,
    salary_period: data.salary_period === undefined ? undefined : data.salary_period ?? "",
  });
}

// ── Projects ──

export function toProjectRow(r: RecordModel): Project {
  return {
    id: r.id,
    user_id: r.user as string,
    client_id: (str(r.client) ?? ""),
    name: (str(r.name) ?? ""),
    billing_type: (str(r.billing_type) ?? "hourly") as BillingType,
    rate: num(r.rate),
    fixed_budget: num(r.fixed_budget),
    status: (str(r.status) ?? "active") as ProjectStatus,
    jira_avatar_url: str(r.jira_avatar_url),
    created_at: createdAt(r),
  };
}

export function fromProject(data: ProjectInsert | ProjectUpdate): Record<string, unknown> {
  const insert = data as Partial<ProjectInsert>;
  return defined({
    user: insert.user_id,
    client: data.client_id,
    name: data.name,
    billing_type: data.billing_type,
    rate: data.rate,
    fixed_budget: data.fixed_budget,
    status: data.status,
    jira_avatar_url: data.jira_avatar_url,
  });
}

// ── Sessions ──

export function toSessionRow(r: RecordModel): Session {
  return {
    id: r.id,
    user_id: r.user as string,
    client_id: str(r.client),
    project_id: str(r.project),
    name: (str(r.name) ?? ""),
    notes: str(r.notes),
    tags: tags(r.tags),
    started_at: toIso(r.started_at),
    duration_seconds: num(r.duration_seconds) ?? 0,
    rate: num(r.rate) ?? 0,
    billing_type: (str(r.billing_type) ?? "hourly") as BillingType,
    payment_status: (str(r.payment_status) ?? "unpaid") as PaymentStatus,
    jira_worklog_id: str(r.jira_worklog_id),
    created_at: createdAt(r),
  };
}

export function fromSession(data: SessionInsert | SessionUpdate): Record<string, unknown> {
  const insert = data as Partial<SessionInsert>;
  return defined({
    user: insert.user_id,
    client: data.client_id === undefined ? undefined : data.client_id ?? "",
    project: data.project_id === undefined ? undefined : data.project_id ?? "",
    name: data.name,
    notes: data.notes,
    tags: data.tags,
    started_at: data.started_at,
    duration_seconds: data.duration_seconds,
    rate: data.rate,
    billing_type: data.billing_type,
    payment_status: data.payment_status,
    jira_worklog_id: data.jira_worklog_id === undefined ? undefined : data.jira_worklog_id ?? "",
  });
}

// ── Jira ──

export function toJiraConnectionRow(r: RecordModel): JiraConnection {
  return {
    id: r.id,
    user_id: r.user as string,
    cloud_id: (str(r.cloud_id) ?? ""),
    site_name: str(r.site_name),
    site_url: str(r.site_url),
    atlassian_email: str(r.atlassian_email),
    atlassian_account_id: str(r.atlassian_account_id),
    access_token: (str(r.access_token) ?? ""),
    refresh_token: (str(r.refresh_token) ?? ""),
    token_expires_at: toIsoOrNull(r.token_expires_at),
    last_synced_at: toIsoOrNull(r.last_synced_at),
  };
}

export function toJiraProjectMappingRow(r: RecordModel): JiraProjectMapping {
  return {
    id: r.id,
    user_id: r.user as string,
    jira_project_key: (str(r.jira_project_key) ?? ""),
    jira_project_name: str(r.jira_project_name),
    jira_project_avatar_url: str(r.jira_project_avatar_url),
    client_id: str(r.client),
    project_id: str(r.project),
  };
}

export function fromJiraProjectMapping(data: JiraProjectMappingInput): Record<string, unknown> {
  return defined({
    jira_project_key: data.jira_project_key,
    jira_project_name: data.jira_project_name ?? "",
    jira_project_avatar_url: data.jira_project_avatar_url ?? "",
    client: data.client_id ?? "",
    project: data.project_id ?? "",
  });
}

// ── Invoices ──

export function toInvoiceRow(r: RecordModel): Invoice {
  return {
    id: r.id,
    user_id: r.user as string,
    client_id: (str(r.client) ?? ""),
    invoice_number: (str(r.invoice_number) ?? ""),
    subtotal: num(r.subtotal) ?? 0,
    tax_rate: num(r.tax_rate) ?? 0,
    tax_amount: num(r.tax_amount) ?? 0,
    total: num(r.total) ?? 0,
    currency: (str(r.currency) ?? "USD"),
    status: (str(r.status) ?? "draft") as InvoiceStatus,
    due_date: toIsoOrNull(r.due_date),
    sent_at: toIsoOrNull(r.sent_at),
    paid_at: toIsoOrNull(r.paid_at),
    notes: str(r.notes),
    created_at: createdAt(r),
  };
}

export function fromInvoice(data: InvoiceInsert | InvoiceUpdate): Record<string, unknown> {
  const insert = data as Partial<InvoiceInsert>;
  return defined({
    user: insert.user_id,
    client: data.client_id,
    invoice_number: data.invoice_number,
    subtotal: data.subtotal,
    tax_rate: data.tax_rate,
    tax_amount: data.tax_amount,
    total: data.total,
    currency: data.currency,
    status: data.status,
    due_date: data.due_date === undefined ? undefined : data.due_date ?? "",
    sent_at: data.sent_at === undefined ? undefined : data.sent_at ?? "",
    paid_at: data.paid_at === undefined ? undefined : data.paid_at ?? "",
    notes: data.notes,
  });
}

// ── Invoice items ──

export function toInvoiceItemRow(r: RecordModel): InvoiceItem {
  return {
    id: r.id,
    invoice_id: (str(r.invoice) ?? ""),
    session_id: str(r.session),
    description: (str(r.description) ?? ""),
    quantity: num(r.quantity) ?? 0,
    rate: num(r.rate) ?? 0,
    amount: num(r.amount) ?? 0,
  };
}

export function fromInvoiceItem(data: InvoiceItemInsert | InvoiceItemUpdate): Record<string, unknown> {
  const insert = data as Partial<InvoiceItemInsert>;
  return defined({
    invoice: insert.invoice_id,
    session: data.session_id === undefined ? undefined : data.session_id ?? "",
    description: data.description,
    quantity: data.quantity,
    rate: data.rate,
    amount: data.amount,
  });
}

// ── Activities ──

export function toActivityRow(r: RecordModel): Activity {
  return {
    id: r.id,
    user_id: r.user as string,
    client_id: str(r.client),
    type: (str(r.type) ?? "note") as ActivityType,
    description: (str(r.description) ?? ""),
    created_at: createdAt(r),
  };
}

export function fromActivity(data: ActivityInsert): Record<string, unknown> {
  return defined({
    user: data.user_id,
    client: data.client_id ?? "",
    type: data.type,
    description: data.description,
  });
}
