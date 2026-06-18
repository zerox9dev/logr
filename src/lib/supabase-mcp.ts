import { createClient } from "@supabase/supabase-js";
import type { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";
import { createRemoteJWKSet, jwtVerify } from "jose";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/** Admin client — kept for any callers outside verifyToken */
export function getAdminClient() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
}

// ---------------------------------------------------------------------------
// JWKS-based token verification for Supabase OAuth 2.1 / third-party tokens
// ---------------------------------------------------------------------------
const JWKS = createRemoteJWKSet(
  new URL(`${SUPABASE_URL}/auth/v1/.well-known/jwks.json`)
);

/**
 * Verify a Supabase-issued OAuth access token via JWKS (ES256).
 * Returns { userId } on success, null on any failure.
 */
export async function verifyAccessToken(
  bearer: string
): Promise<{ userId: string } | null> {
  try {
    const { payload } = await jwtVerify(bearer, JWKS, {
      issuer: `${SUPABASE_URL}/auth/v1`,
    });
    if (!payload.sub) return null;
    return { userId: payload.sub };
  } catch {
    return null;
  }
}

/** Per-request user-scoped client — all queries automatically RLS-filtered */
export function getUserClient(authInfo: AuthInfo) {
  const accessToken = (authInfo.extra as { accessToken: string }).accessToken;
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false },
  });
}
