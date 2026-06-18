import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/supabase";
import { serverSupabaseUrl } from "@/lib/supabase-url";

const supabaseUrl = serverSupabaseUrl;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/** Server Supabase client for Server Components / Route Handlers — reads and
 *  writes the auth session from request cookies. */
export async function createServerSupabase() {
  const cookieStore = await cookies();
  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component (read-only cookies) — middleware refreshes instead.
        }
      },
    },
  });
}
