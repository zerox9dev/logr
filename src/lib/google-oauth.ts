import type { NextRequest } from "next/server";

/** Provider name as configured in PocketBase's auth provider settings. */
export const GOOGLE_PROVIDER = "google";

/** Path of the callback Route Handler. Must match, byte for byte, the
 *  "Authorized redirect URI" registered in the Google Cloud OAuth client. */
export const GOOGLE_CALLBACK_PATH = "/auth/callback/google";

/** Holds the OAuth2 `state` + PKCE verifier across the round-trip to Google.
 *  Short-lived and cleared by the callback. */
export const OAUTH_STATE_COOKIE = "pb_oauth_google";

const OAUTH_STATE_MAX_AGE = 60 * 10;

export const oauthStateCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: OAUTH_STATE_MAX_AGE,
} as const;

export interface OAuthStatePayload {
  state: string;
  codeVerifier: string;
  next?: string;
}

export function parseOAuthState(raw: string | undefined): OAuthStatePayload | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const { state, codeVerifier, next } = parsed as Record<string, unknown>;
    if (typeof state !== "string" || !state) return null;
    if (typeof codeVerifier !== "string" || !codeVerifier) return null;
    return { state, codeVerifier, next: typeof next === "string" ? next : undefined };
  } catch {
    return null;
  }
}

/** Only same-origin paths survive the round-trip, so a crafted `?next=` on the
 *  sign-in link cannot turn the callback into an open redirect. */
export function safeNext(value: string | null | undefined): string | undefined {
  if (!value || !value.startsWith("/")) return undefined;
  if (value.startsWith("//") || value.startsWith("/\\")) return undefined;
  return value;
}

/** Public origin of this app. Google compares the redirect URI against the
 *  registered one, so a proxy that rewrites Host would otherwise break the
 *  exchange — set APP_URL when the forwarded headers cannot be trusted. */
export function resolveOrigin(request: NextRequest): string {
  const configured = process.env.APP_URL;
  if (configured) return configured.replace(/\/+$/, "");

  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (host) {
    const proto = request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol.replace(":", "");
    return `${proto}://${host}`;
  }
  return request.nextUrl.origin;
}

export function googleRedirectUrl(origin: string): string {
  return `${origin}${GOOGLE_CALLBACK_PATH}`;
}

export type GoogleAuthError = "unavailable" | "failed" | "denied";

/** Sends the visitor back to the sign-in screen with a code the page turns into
 *  a localized message — never a raw provider error or stack trace. */
export function loginErrorUrl(origin: string, error: GoogleAuthError, next?: string): URL {
  const url = new URL("/login", origin);
  url.searchParams.set("error", `google_${error}`);
  if (next) url.searchParams.set("next", next);
  return url;
}
