import { createClient } from "@supabase/supabase-js";
import type {
  UserSettings, UserSettingsInsert, UserSettingsUpdate,
  Client, ClientInsert, ClientUpdate,
  Project, ProjectInsert, ProjectUpdate,
  Session, SessionInsert, SessionUpdate,
  Invoice, InvoiceInsert, InvoiceUpdate,
  InvoiceItem, InvoiceItemInsert, InvoiceItemUpdate,
  Activity, ActivityInsert,
} from "@/types/database";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. " +
    "Add them to .env.local (dev) or Vercel Environment Variables (prod)."
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

// Database schema composed from the project's generated row/insert/update aliases,
// so the supabase-js client is typed and api.ts needs no payload casts.
export interface Database {
  public: {
    Tables: {
      // Insert is upsert-shaped: user_id is required; other columns are nullable/DB-defaulted.
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

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
