import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/pocketbase-server";
import {
  INTEGRATIONS_PATH,
  JIRA_STATE_COOKIE,
  atlassianCredentials,
  authorizeUrl,
  integrationsUrl,
  jiraStateCookieOptions,
  resolveOrigin,
  safeNext,
} from "@/lib/atlassian-oauth";

/** Starts the Jira connect flow. Unlike Google sign-in this requires an
 *  existing logr session — connecting Jira attaches a credential to an account,
 *  so there is nothing to attach it to while signed out. */
export async function GET(request: NextRequest) {
  const origin = resolveOrigin(request);
  const next = safeNext(request.nextUrl.searchParams.get("next"));

  const user = await getCurrentUser();
  if (!user) {
    const login = new URL("/login", origin);
    login.searchParams.set("next", next ?? INTEGRATIONS_PATH);
    return NextResponse.redirect(login);
  }

  const credentials = atlassianCredentials();
  if (!credentials) return NextResponse.redirect(integrationsUrl(origin, { error: "unavailable" }, next));

  const state = crypto.randomUUID();
  const response = NextResponse.redirect(authorizeUrl(credentials.clientId, origin, state));
  response.cookies.set(JIRA_STATE_COOKIE, JSON.stringify({ state, next }), jiraStateCookieOptions);
  return response;
}
