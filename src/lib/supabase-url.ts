/**
 * Base Supabase URL for **server-side** calls.
 *
 * Almost always the same as the public `NEXT_PUBLIC_SUPABASE_URL`. The optional
 * `SUPABASE_INTERNAL_URL` override exists only for the edge case where the app
 * container reaches Supabase at a different address than the browser does — e.g.
 * a self-hosted Supabase on the same Docker network, where the browser uses the
 * public URL but the server should use the internal service hostname. Unset on
 * Supabase Cloud and Vercel, so behavior there is unchanged.
 */
export const serverSupabaseUrl =
  process.env.SUPABASE_INTERNAL_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!;
