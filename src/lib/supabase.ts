import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase credentials missing — running in local mode");
}

export const supabase = createClient(
  supabaseUrl || "http://localhost",
  supabaseAnonKey || "placeholder"
);
