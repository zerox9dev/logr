// ── Enums (match DB exactly) ──

export type BillingType = "hourly" | "fixed";
export type PaymentStatus = "unpaid" | "invoiced" | "paid";
export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue";
export type ProjectStatus = "active" | "paused" | "completed" | "cancelled";
export type FunnelType = "sales" | "onboarding" | "delivery" | "reactivation" | "job_hunting";
export type ActivityType = "call" | "email" | "meeting" | "note" | "payment";

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
  created_at: string;
}

export interface Session {
  id: string;
  user_id: string;
  client_id: string | null;
  project_id: string | null;
  name: string;
  notes: string | null;
  started_at: string;
  duration_seconds: number;
  rate: number;
  billing_type: BillingType;
  payment_status: PaymentStatus;
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

export interface ShareLink {
  id: string;
  invoice_id: string;
  token: string;
  expires_at: string | null;
  created_at: string;
}

export interface Funnel {
  id: string;
  user_id: string;
  name: string;
  type: FunnelType;
  created_at: string;
}

export interface FunnelStage {
  id: string;
  funnel_id: string;
  title: string;
  position: number;
  created_at: string;
}

export interface Lead {
  id: string;
  user_id: string;
  funnel_id: string;
  stage_id: string;
  client_id: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  value: number | null;
  currency: string | null;
  source: string | null;
  tags: string[];
  notes: string | null;
  created_at: string;
}

export interface Activity {
  id: string;
  user_id: string;
  client_id: string | null;
  lead_id: string | null;
  type: ActivityType;
  description: string;
  created_at: string;
}

// ── Insert types (omit server-generated fields) ──

export type UserSettingsInsert = Omit<UserSettings, "id" | "created_at" | "updated_at">;
export type UserSettingsUpdate = Partial<Omit<UserSettings, "id" | "user_id" | "created_at" | "updated_at">>;

export type ClientInsert = Omit<Client, "id" | "created_at" | "updated_at"> & { tags?: string[] };
export type ClientUpdate = Partial<Omit<Client, "id" | "user_id" | "created_at" | "updated_at">>;

export type ProjectInsert = Omit<Project, "id" | "created_at">;
export type ProjectUpdate = Partial<Omit<Project, "id" | "user_id" | "created_at">>;

export type SessionInsert = Omit<Session, "id" | "created_at">;
export type SessionUpdate = Partial<Omit<Session, "id" | "user_id" | "created_at">>;

export type InvoiceInsert = Omit<Invoice, "id" | "created_at">;
export type InvoiceUpdate = Partial<Omit<Invoice, "id" | "user_id" | "created_at">>;

export type InvoiceItemInsert = Omit<InvoiceItem, "id">;
export type InvoiceItemUpdate = Partial<Omit<InvoiceItem, "id" | "invoice_id">>;

export type FunnelInsert = Omit<Funnel, "id" | "created_at">;
export type FunnelUpdate = Partial<Omit<Funnel, "id" | "user_id" | "created_at">>;

export type FunnelStageInsert = Omit<FunnelStage, "id" | "created_at">;
export type FunnelStageUpdate = Partial<Omit<FunnelStage, "id" | "funnel_id" | "created_at">>;

export type LeadInsert = Omit<Lead, "id" | "created_at"> & { tags?: string[] };
export type LeadUpdate = Partial<Omit<Lead, "id" | "user_id" | "created_at">>;

export type ActivityInsert = Omit<Activity, "id" | "created_at">;

// ── Database schema for supabase-js ──

export interface Database {
  public: {
    Tables: {
      user_settings: { Row: UserSettings; Insert: UserSettingsInsert; Update: UserSettingsUpdate };
      clients: { Row: Client; Insert: ClientInsert; Update: ClientUpdate };
      projects: { Row: Project; Insert: ProjectInsert; Update: ProjectUpdate };
      sessions: { Row: Session; Insert: SessionInsert; Update: SessionUpdate };
      invoices: { Row: Invoice; Insert: InvoiceInsert; Update: InvoiceUpdate };
      invoice_items: { Row: InvoiceItem; Insert: InvoiceItemInsert; Update: InvoiceItemUpdate };
      share_links: { Row: ShareLink };
      funnels: { Row: Funnel; Insert: FunnelInsert; Update: FunnelUpdate };
      funnel_stages: { Row: FunnelStage; Insert: FunnelStageInsert; Update: FunnelStageUpdate };
      leads: { Row: Lead; Insert: LeadInsert; Update: LeadUpdate };
      activities: { Row: Activity; Insert: ActivityInsert };
    };
  };
}
