import { supabase } from "@/lib/supabase";
import type {
  UserSettings, UserSettingsUpdate,
  Client, ClientInsert, ClientUpdate,
  Project, ProjectInsert, ProjectUpdate,
  Session, SessionInsert, SessionUpdate,
  Invoice, InvoiceInsert, InvoiceUpdate,
  InvoiceItem, InvoiceItemInsert, InvoiceItemUpdate,
  Activity, ActivityInsert,
} from "@/types/database";

// ── Helper ──

function unwrap<T>(result: { data: T | null; error: unknown }): T {
  if (result.error) throw result.error;
  return result.data!;
}

// ── Auth ──

export const auth = {
  getUser: () => supabase.auth.getUser(),
  getSession: () => supabase.auth.getSession(),
  signInWithGoogle: (next?: string) => {
    const callbackUrl = new URL(`${window.location.origin}/auth/callback`);
    if (next) callbackUrl.searchParams.set("next", next);
    return supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callbackUrl.toString() },
    });
  },
  signInWithMagicLink: (email: string, next?: string) => {
    const callbackUrl = new URL(`${window.location.origin}/auth/callback`);
    if (next) callbackUrl.searchParams.set("next", next);
    return supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: callbackUrl.toString() },
    });
  },
  signOut: () => supabase.auth.signOut(),
  onAuthStateChange: (cb: Parameters<typeof supabase.auth.onAuthStateChange>[0]) =>
    supabase.auth.onAuthStateChange(cb),
};

// ── User Settings ──

export const settingsApi = {
  get: async () => {
    const { data } = await supabase.from("user_settings").select().single();
    return data as UserSettings | null;
  },
  upsert: async (userId: string, update: UserSettingsUpdate) => {
    return unwrap(
      await supabase.from("user_settings").upsert({ user_id: userId, ...update }, { onConflict: "user_id" }).select().single()
    ) as UserSettings;
  },
};

// ── Clients ──

export const clientsApi = {
  list: async () =>
    unwrap(await supabase.from("clients").select().order("created_at", { ascending: false })) as Client[],
  create: async (data: ClientInsert) =>
    unwrap(await supabase.from("clients").insert(data).select().single()) as Client,
  update: async (id: string, data: ClientUpdate) =>
    unwrap(await supabase.from("clients").update(data).eq("id", id).select().single()) as Client,
  delete: async (id: string) => {
    await supabase.from("clients").delete().eq("id", id);
  },
};

// ── Projects ──

export const projectsApi = {
  list: async () =>
    unwrap(await supabase.from("projects").select().order("created_at", { ascending: false })) as Project[],
  create: async (data: ProjectInsert) =>
    unwrap(await supabase.from("projects").insert(data).select().single()) as Project,
  update: async (id: string, data: ProjectUpdate) =>
    unwrap(await supabase.from("projects").update(data).eq("id", id).select().single()) as Project,
  delete: async (id: string) => {
    await supabase.from("projects").delete().eq("id", id);
  },
};

// ── Sessions (time entries) ──

const SESSION_BULK_CHUNK = 100;

export const sessionsApi = {
  list: async () =>
    unwrap(await supabase.from("sessions").select().order("started_at", { ascending: false })) as Session[],
  create: async (data: SessionInsert) =>
    unwrap(await supabase.from("sessions").insert(data).select().single()) as Session,
  /** Bulk-insert sessions in chunks of up to 100 rows. Returns all created rows. */
  createMany: async (rows: SessionInsert[]): Promise<Session[]> => {
    const results: Session[] = [];
    for (let i = 0; i < rows.length; i += SESSION_BULK_CHUNK) {
      const chunk = rows.slice(i, i + SESSION_BULK_CHUNK);
      const created = unwrap(await supabase.from("sessions").insert(chunk).select()) as Session[];
      results.push(...created);
    }
    return results;
  },
  update: async (id: string, data: SessionUpdate) =>
    unwrap(await supabase.from("sessions").update(data).eq("id", id).select().single()) as Session,
  delete: async (id: string) => {
    await supabase.from("sessions").delete().eq("id", id);
  },
};

// ── Invoices ──

export const invoicesApi = {
  list: async () =>
    unwrap(await supabase.from("invoices").select().order("created_at", { ascending: false })) as Invoice[],
  create: async (data: InvoiceInsert) =>
    unwrap(await supabase.from("invoices").insert(data).select().single()) as Invoice,
  update: async (id: string, data: InvoiceUpdate) =>
    unwrap(await supabase.from("invoices").update(data).eq("id", id).select().single()) as Invoice,
  delete: async (id: string) => {
    await supabase.from("invoices").delete().eq("id", id);
  },
};

// ── Invoice Items ──

export const invoiceItemsApi = {
  listByInvoice: async (invoiceId: string) =>
    unwrap(await supabase.from("invoice_items").select().eq("invoice_id", invoiceId)) as InvoiceItem[],
  /** Session ids already attached to any invoice — used to find unbilled sessions. */
  listBilledSessionIds: async () => {
    const rows = unwrap(await supabase.from("invoice_items").select("session_id").not("session_id", "is", null)) as { session_id: string | null }[];
    return rows.map((r) => r.session_id).filter((id): id is string => id != null);
  },
  create: async (data: InvoiceItemInsert) =>
    unwrap(await supabase.from("invoice_items").insert(data).select().single()) as InvoiceItem,
  createMany: async (items: InvoiceItemInsert[]) =>
    unwrap(await supabase.from("invoice_items").insert(items).select()) as InvoiceItem[],
  update: async (id: string, data: InvoiceItemUpdate) =>
    unwrap(await supabase.from("invoice_items").update(data).eq("id", id).select().single()) as InvoiceItem,
  delete: async (id: string) => {
    await supabase.from("invoice_items").delete().eq("id", id);
  },
  deleteByInvoice: async (invoiceId: string) => {
    await supabase.from("invoice_items").delete().eq("invoice_id", invoiceId);
  },
};

// ── Activities ──

export const activitiesApi = {
  list: async (limit = 50) =>
    unwrap(await supabase.from("activities").select().order("created_at", { ascending: false }).limit(limit)) as Activity[],
  listByClient: async (clientId: string) =>
    unwrap(await supabase.from("activities").select().eq("client_id", clientId).order("created_at", { ascending: false })) as Activity[],
  create: async (data: ActivityInsert) =>
    unwrap(await supabase.from("activities").insert(data).select().single()) as Activity,
  delete: async (id: string) => {
    await supabase.from("activities").delete().eq("id", id);
  },
};
