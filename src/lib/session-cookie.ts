import { PB_AUTH_COOKIE } from "@/lib/pocketbase";

export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

/** `exportToCookie()` returns a full Set-Cookie string; Next wants the value alone. */
export function cookieValue(serialized: string): string {
  const [pair] = serialized.split(";");
  return pair.slice(pair.indexOf("=") + 1);
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: SESSION_MAX_AGE,
} as const;

/** Writer for a `cookies()` store (Server Actions) and for a `NextResponse`
 *  (Route Handlers) alike — both expose the same `set(name, value, opts)`. */
interface CookieWriter {
  set(name: string, value: string, options: typeof sessionCookieOptions): unknown;
}

export function setSessionCookie(target: CookieWriter, value: string): void {
  target.set(PB_AUTH_COOKIE, value, sessionCookieOptions);
}
