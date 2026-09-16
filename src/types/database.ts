// ── Enums (match DB exactly) ──

export type BillingType = "hourly" | "fixed";
export type PaymentStatus = "unpaid" | "paid";
export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue";
export type ProjectStatus = "active" | "paused" | "completed" | "cancelled";
export type ActivityType = "call" | "email" | "meeting" | "note" | "payment";
export type ClientType = "client" | "employer";
export type SalaryPeriod = "hourly" | "monthly" | "annual";

// ── Row types (match DB columns 1:1) ──

export interface UserSettings {
  id: string;
  user_id: string;
  full_name: string | null;
  company: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  default_currency: string;
  default_rate: number | null;
  logo_url: string | null;
  weekly_goal_hours: number | null;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  address: string | null;
  country: string | null;
  website: string | null;
  tags: string[];
  notes: string | null;
  client_type: ClientType;
  salary_amount: number | null;
  salary_period: SalaryPeriod | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  client_id: string;
  name: string;
  billing_type: BillingType;
  rate: number | null;
  fixed_budget: number | null;
  status: ProjectStatus;
  /** Jira project avatar this project was synced from, served through
   *  /api/jira/avatar. Null for projects that never came from Jira. */
  jira_avatar_url: string | null;
  created_at: string;
}

export interface Session {
  id: string;
  user_id: string;
  client_id: string | null;
  project_id: string | null;
  name: string;
  notes: string | null;
  tags: string[];
  started_at: string;
  duration_seconds: number;
  rate: number;
  billing_type: BillingType;
  payment_status: PaymentStatus;
  jira_worklog_id: string | null;
  created_at: string;
}

export interface Invoice {
  id: string;
  user_id: string;
  client_id: string;
  invoice_number: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  currency: string;
  status: InvoiceStatus;
  due_date: string | null;
  sent_at: string | null;
  paid_at: string | null;
  notes: string | null;
  created_at: string;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  session_id: string | null;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

/** Stored Atlassian credential for an already-signed-in logr user. The two
 *  token fields never leave the server — Server Actions hand client code the
 *  `JiraConnectionSummary` shape instead. */
export interface JiraConnection {
  id: string;
  user_id: string;
  cloud_id: string;
  site_name: string | null;
  site_url: string | null;
  atlassian_email: string | null;
  atlassian_account_id: string | null;
  access_token: string;
  refresh_token: string;
  token_expires_at: string | null;
  last_synced_at: string | null;
}

export interface JiraConnectionSummary {
  connected: boolean;
  siteName: string | null;
  siteUrl: string | null;
  atlassianEmail: string | null;
  lastSyncedAt: string | null;
}

export interface JiraProjectMapping {
  id: string;
  user_id: string;
  jira_project_key: string;
  jira_project_name: string | null;
  jira_project_avatar_url: string | null;
  client_id: string | null;
  project_id: string | null;
}

export type JiraProjectMappingInput = Omit<
  JiraProjectMapping,
  "id" | "user_id" | "jira_project_avatar_url"
> & { jira_project_avatar_url?: string | null };

export interface Activity {
  id: string;
  user_id: string;
  client_id: string | null;
  type: ActivityType;
  description: string;
  created_at: string;
}

// ── Insert types (omit server-generated fields) ──

export type UserSettingsInsert = Omit<UserSettings, "id" | "created_at" | "updated_at">;
export type UserSettingsUpdate = Partial<Omit<UserSettings, "id" | "user_id" | "created_at" | "updated_at">>;

export type ClientInsert =
  Omit<Client, "id" | "created_at" | "updated_at" | "client_type" | "salary_amount" | "salary_period"> & {
    tags?: string[];
    client_type?: ClientType;
    salary_amount?: number | null;
    salary_period?: SalaryPeriod | null;
  };
export type ClientUpdate = Partial<Omit<Client, "id" | "user_id" | "created_at" | "updated_at">>;

export type ProjectInsert = Omit<Project, "id" | "created_at" | "jira_avatar_url"> & {
  jira_avatar_url?: string | null;
};
export type ProjectUpdate = Partial<Omit<Project, "id" | "user_id" | "created_at">>;

export type SessionInsert = Omit<Session, "id" | "created_at" | "jira_worklog_id"> & {
  jira_worklog_id?: string | null;
};
export type SessionUpdate = Partial<Omit<Session, "id" | "user_id" | "created_at">>;

export type InvoiceInsert = Omit<Invoice, "id" | "created_at">;
export type InvoiceUpdate = Partial<Omit<Invoice, "id" | "user_id" | "created_at">>;

export type InvoiceItemInsert = Omit<InvoiceItem, "id">;
export type InvoiceItemUpdate = Partial<Omit<InvoiceItem, "id" | "invoice_id">>;

export type ActivityInsert = Omit<Activity, "id" | "created_at">;


