/**
 * Base Supabase URL for **server-side** calls.
 *
 * In a containerized self-host, the browser reaches Supabase at the public
 * `NEXT_PUBLIC_SUPABASE_URL` (e.g. `http://localhost:8000`), but server-side
 * code running *inside* the app container must use the internal service URL
 * (e.g. `http://kong:8000`) — `localhost` there points at the app container,
 * not the API gateway.
 *
 * Set `SUPABASE_INTERNAL_URL` in docker-compose. When it's unset (hosted /
 * Vercel, where both origins are the same), this falls back to the public URL,
 * so behavior is unchanged for non-containerized deployments.
 */
export const serverSupabaseUrl =
  process.env.SUPABASE_INTERNAL_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!;
