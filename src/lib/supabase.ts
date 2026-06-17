import { createBrowserClient } from "@supabase/ssr";
import type {
  UserSettings, UserSettingsInsert, UserSettingsUpdate,
  Client, ClientInsert, ClientUpdate,
  Project, ProjectInsert, ProjectUpdate,
  Session, SessionInsert, SessionUpdate,
  Invoice, InvoiceInsert, InvoiceUpdate,
  InvoiceItem, InvoiceItemInsert, InvoiceItemUpdate,
  Activity, ActivityInsert,
} from "@/types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
    "Add them to .env.local (dev) and Vercel Environment Variables (prod)."
  );
}

// The generated row types in src/types/database.ts are declared with `interface`,
// which lacks the implicit index signature supabase-js's `GenericSchema` requires.
// Mapping each through `Indexed` gives it that signature so the client is fully typed.
type Indexed<T> = { [K in keyof T]: T[K] };

type TableDef<Row, Insert, Update> = {
  Row: Indexed<Row>;
  Insert: Indexed<Insert>;
  Update: Indexed<Update>;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      user_settings: TableDef<UserSettings, Partial<UserSettingsInsert> & { user_id: string }, UserSettingsUpdate>;
      clients: TableDef<Client, ClientInsert, ClientUpdate>;
      projects: TableDef<Project, ProjectInsert, ProjectUpdate>;
      sessions: TableDef<Session, SessionInsert, SessionUpdate>;
      invoices: TableDef<Invoice, InvoiceInsert, InvoiceUpdate>;
      invoice_items: TableDef<InvoiceItem, InvoiceItemInsert, InvoiceItemUpdate>;
      activities: TableDef<Activity, ActivityInsert, Partial<ActivityInsert>>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

/** Browser Supabase client (cookie-based session via @supabase/ssr). */
export const supabase = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
