import { NextResponse, type NextRequest } from "next/server";
import { PB_AUTH_COOKIE, createPb } from "@/lib/pocketbase";
import { cookieValue, setSessionCookie } from "@/lib/session-cookie";
import {
  GOOGLE_PROVIDER,
  OAUTH_STATE_COOKIE,
  googleRedirectUrl,
  loginErrorUrl,
  parseOAuthState,
  resolveOrigin,
  safeNext,
} from "@/lib/google-oauth";

/** Google's redirect target. Exchanges the authorization code for a PocketBase
 *  session server-side and hands the browser the same `pb_auth` cookie the
 *  password sign-in writes. */
export async function GET(request: NextRequest) {
  const origin = resolveOrigin(request);
  const params = request.nextUrl.searchParams;
  const stored = parseOAuthState(request.cookies.get(OAUTH_STATE_COOKIE)?.value);
  const next = safeNext(stored?.next);

  const fail = (error: "denied" | "failed") => {
    const response = NextResponse.redirect(loginErrorUrl(origin, error, next));
    response.cookies.delete(OAUTH_STATE_COOKIE);
    return response;
  };

  if (params.get("error")) return fail("denied");

  const code = params.get("code");
  const state = params.get("state");
  if (!code || !state || !stored || state !== stored.state) return fail("failed");

  const pb = createPb();
  try {
    await pb
      .collection("users")
      .authWithOAuth2Code(GOOGLE_PROVIDER, code, stored.codeVerifier, googleRedirectUrl(origin));
  } catch {
    return fail("failed");
  }
  if (!pb.authStore.isValid) return fail("failed");

  const response = NextResponse.redirect(new URL(next ?? "/app", origin));
  setSessionCookie(
    response.cookies,
    cookieValue(pb.authStore.exportToCookie({ httpOnly: true }, PB_AUTH_COOKIE)),
  );
  response.cookies.delete(OAUTH_STATE_COOKIE);
  return response;
}
