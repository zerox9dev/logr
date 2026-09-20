import type { NextRequest } from "next/server";
import { PB_AUTH_COOKIE } from "@/lib/pocketbase";

/** Fallback lifetime, used only when the token carries no readable `exp`. */
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

/** Seconds until the PocketBase token inside the cookie expires.
 *  The cookie must not outlive the token: a cookie that is still present while
 *  its token has expired makes every request anonymous again with no way for
 *  the app to tell a dropped session from a stale one. */
function tokenMaxAge(value: string): number {
  try {
    const { token } = JSON.parse(decodeURIComponent(value)) as { token?: string };
    const payload = token?.split(".")[1];
    if (!payload) return SESSION_MAX_AGE;
    const { exp } = JSON.parse(
      Buffer.from(payload, "base64").toString("utf8"),
    ) as { exp?: number };
    if (typeof exp !== "number") return SESSION_MAX_AGE;
    const seconds = Math.floor(exp - Date.now() / 1000);
    return seconds > 0 ? seconds : SESSION_MAX_AGE;
  } catch {
    return SESSION_MAX_AGE;
  }
}

/** `exportToCookie()` returns a full Set-Cookie string; Next wants the value alone. */
export function cookieValue(serialized: string): string {
  const [pair] = serialized.split(";");
  return pair.slice(pair.indexOf("=") + 1);
}

interface SessionCookieOptions {
  httpOnly: true;
  secure: boolean;
  sameSite: "lax";
  path: "/";
  maxAge: number;
}

/** `Secure` is keyed off the actual scheme, not NODE_ENV: a self-hosted
 *  deployment served over plain HTTP is a production build, and a Secure
 *  cookie there is silently dropped by the browser — sign-in appears to
 *  succeed and the very next request is anonymous again. */
function options(secure: boolean, maxAge: number): SessionCookieOptions {
  return { httpOnly: true, secure, sameSite: "lax", path: "/", maxAge };
}

/** True when the browser reached us over HTTPS, honouring a terminating proxy. */
export function isSecureRequest(headers: {
  get(name: string): string | null;
}): boolean {
  const forwarded = headers.get("x-forwarded-proto");
  if (forwarded) return forwarded.split(",")[0].trim() === "https";
  const appUrl = process.env.APP_URL;
  if (appUrl) return appUrl.startsWith("https://");
  // Scheme unknown: keep the safe production default rather than silently
  // dropping `Secure` on an HTTPS deployment whose proxy forwards no hints.
  return process.env.NODE_ENV === "production";
}

/** Writer for a `cookies()` store (Server Actions) and for a `NextResponse`
 *  (Route Handlers) alike — both expose the same `set(name, value, opts)`. */
interface CookieWriter {
  set(name: string, value: string, options: SessionCookieOptions): unknown;
}

export function setSessionCookie(
  target: CookieWriter,
  value: string,
  secure: boolean,
): void {
  target.set(PB_AUTH_COOKIE, value, options(secure, tokenMaxAge(value)));
}

/** Scheme of the incoming request in a Route Handler. */
export function requestIsSecure(request: NextRequest): boolean {
  const forwarded = request.headers.get("x-forwarded-proto");
  if (forwarded) return forwarded.split(",")[0].trim() === "https";
  if (request.nextUrl.protocol === "https:") return true;
  return isSecureRequest(request.headers);
}
