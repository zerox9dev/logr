import { NextResponse, type NextRequest } from "next/server";
import { createPb } from "@/lib/pocketbase";
import {
  GOOGLE_PROVIDER,
  OAUTH_STATE_COOKIE,
  googleRedirectUrl,
  loginErrorUrl,
  oauthStateCookieOptions,
  resolveOrigin,
  safeNext,
} from "@/lib/google-oauth";

/** Starts Google sign-in. The whole OAuth2 handshake is driven server-side —
 *  PocketBase sits on an internal address the browser cannot reach, so the
 *  SDK's popup-based `authWithOAuth2` is not an option here. */
export async function GET(request: NextRequest) {
  const origin = resolveOrigin(request);
  const next = safeNext(request.nextUrl.searchParams.get("next"));

  const pb = createPb();
  let authURL: string;
  let state: string;
  let codeVerifier: string;
  try {
    const methods = await pb.collection("users").listAuthMethods();
    const provider = methods.oauth2?.providers?.find((p) => p.name === GOOGLE_PROVIDER);
    if (!methods.oauth2?.enabled || !provider) {
      return NextResponse.redirect(loginErrorUrl(origin, "unavailable", next));
    }
    ({ authURL, state, codeVerifier } = provider);
  } catch {
    return NextResponse.redirect(loginErrorUrl(origin, "unavailable", next));
  }

  // PocketBase returns `authURL` already ending in `&redirect_uri=`; the value
  // is appended verbatim, the same way the JS SDK builds it.
  const response = NextResponse.redirect(authURL + googleRedirectUrl(origin));
  response.cookies.set(
    OAUTH_STATE_COOKIE,
    JSON.stringify({ state, codeVerifier, next }),
    oauthStateCookieOptions,
  );
  return response;
}
