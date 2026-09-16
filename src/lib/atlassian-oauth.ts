// Atlassian OAuth 2.0 (3LO) for Jira Cloud. Unlike Google sign-in — which
// PocketBase drives end to end — Atlassian is not a PocketBase auth provider
// and a Jira connection is not a login: it is a stored, refreshable credential
// for an already-signed-in logr user. So the handshake is hand-rolled here,
// while the cookie/CSRF/redirect-safety helpers are shared with that flow.
// Endpoints and scopes verified against developer.atlassian.com (OAuth 2.0 3LO
// apps; Jira Cloud platform REST API v3 OpenAPI spec).
import { resolveOrigin, safeNext } from "@/lib/google-oauth";

export { resolveOrigin, safeNext };

export const ATLASSIAN_AUTHORIZE_URL = "https://auth.atlassian.com/authorize";
export const ATLASSIAN_TOKEN_URL = "https://auth.atlassian.com/oauth/token";
export const ATLASSIAN_RESOURCES_URL = "https://api.atlassian.com/oauth/token/accessible-resources";

/** Must match, byte for byte, a callback URL registered on the app in the
 *  Atlassian Developer Console. */
export const JIRA_CALLBACK_PATH = "/auth/callback/jira";

/** Where the flow starts and ends — the only page that shows a connection. */
export const INTEGRATIONS_PATH = "/app/settings/integrations";

/** Holds the OAuth2 `state` across the round-trip to Atlassian. Short-lived
 *  and cleared by the callback. */
export const JIRA_STATE_COOKIE = "pb_oauth_jira";

const STATE_MAX_AGE = 60 * 10;

export const jiraStateCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: STATE_MAX_AGE,
} as const;

/** `read:jira-work` covers projects, issues and worklogs; `read:jira-user`
 *  identifies the connected account so the sync can keep only its own
 *  worklogs; `offline_access` is what makes Atlassian return a refresh token. */
export const JIRA_SCOPES = ["read:jira-work", "read:jira-user", "offline_access"] as const;

/** Refresh a little early so a request never starts on a token that expires
 *  mid-flight. */
export const TOKEN_EXPIRY_BUFFER_MS = 60_000;

export interface JiraStatePayload {
  state: string;
  next?: string;
}

export function parseJiraState(raw: string | undefined): JiraStatePayload | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const { state, next } = parsed as Record<string, unknown>;
    if (typeof state !== "string" || !state) return null;
    return { state, next: typeof next === "string" ? next : undefined };
  } catch {
    return null;
  }
}

export function jiraRedirectUrl(origin: string): string {
  return `${origin}${JIRA_CALLBACK_PATH}`;
}

export interface AtlassianCredentials {
  clientId: string;
  clientSecret: string;
}

/** Null when the deployment has no Atlassian app registered — the UI then
 *  shows "unavailable" instead of bouncing the user to a broken consent page. */
export function atlassianCredentials(): AtlassianCredentials | null {
  const clientId = process.env.ATLASSIAN_CLIENT_ID;
  const clientSecret = process.env.ATLASSIAN_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;
  return { clientId, clientSecret };
}

export function authorizeUrl(clientId: string, origin: string, state: string): string {
  const url = new URL(ATLASSIAN_AUTHORIZE_URL);
  url.searchParams.set("audience", "api.atlassian.com");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("scope", JIRA_SCOPES.join(" "));
  url.searchParams.set("redirect_uri", jiraRedirectUrl(origin));
  url.searchParams.set("state", state);
  url.searchParams.set("response_type", "code");
  // Atlassian only issues a refresh token when consent is re-confirmed.
  url.searchParams.set("prompt", "consent");
  return url.toString();
}

export type JiraAuthError = "unavailable" | "failed" | "denied";

/** Sends the user back to the Integrations page with a code the page turns
 *  into a localized message — never a raw provider error. */
export function integrationsUrl(
  origin: string,
  params: { error?: JiraAuthError; connected?: boolean },
  next?: string,
): URL {
  const url = new URL(next ?? INTEGRATIONS_PATH, origin);
  if (params.error) url.searchParams.set("error", `jira_${params.error}`);
  if (params.connected) url.searchParams.set("connected", "1");
  return url;
}

export interface AtlassianTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

interface TokenResponse {
  access_token?: unknown;
  refresh_token?: unknown;
  expires_in?: unknown;
}

function toTokens(body: TokenResponse, previousRefreshToken?: string): AtlassianTokens | null {
  const accessToken = typeof body.access_token === "string" ? body.access_token : "";
  if (!accessToken) return null;
  const refreshToken =
    typeof body.refresh_token === "string" && body.refresh_token
      ? body.refresh_token
      : previousRefreshToken ?? "";
  const expiresIn = typeof body.expires_in === "number" ? body.expires_in : 3600;
  return {
    accessToken,
    refreshToken,
    expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
  };
}

async function postToken(payload: Record<string, string>): Promise<TokenResponse | null> {
  const response = await fetch(ATLASSIAN_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  if (!response.ok) return null;
  return (await response.json()) as TokenResponse;
}

export async function exchangeCode(
  credentials: AtlassianCredentials,
  code: string,
  origin: string,
): Promise<AtlassianTokens | null> {
  const body = await postToken({
    grant_type: "authorization_code",
    client_id: credentials.clientId,
    client_secret: credentials.clientSecret,
    code,
    redirect_uri: jiraRedirectUrl(origin),
  });
  return body ? toTokens(body) : null;
}

/** Atlassian rotates the refresh token on every use, so both stored tokens are
 *  overwritten with what comes back here. */
export async function refreshTokens(
  credentials: AtlassianCredentials,
  refreshToken: string,
): Promise<AtlassianTokens | null> {
  const body = await postToken({
    grant_type: "refresh_token",
    client_id: credentials.clientId,
    client_secret: credentials.clientSecret,
    refresh_token: refreshToken,
  });
  return body ? toTokens(body, refreshToken) : null;
}

export interface AccessibleResource {
  id: string;
  name: string | null;
  url: string | null;
}

/** `GET /oauth/token/accessible-resources` → the sites this grant can reach.
 *  The first entry is used: one Atlassian account rarely has more than one
 *  Jira site, and picking a site is not worth a second consent screen. */
export async function fetchAccessibleResources(accessToken: string): Promise<AccessibleResource[]> {
  const response = await fetch(ATLASSIAN_RESOURCES_URL, {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
    cache: "no-store",
  });
  if (!response.ok) return [];
  const body: unknown = await response.json();
  if (!Array.isArray(body)) return [];
  return body.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const { id, name, url } = entry as Record<string, unknown>;
    if (typeof id !== "string" || !id) return [];
    return [
      {
        id,
        name: typeof name === "string" ? name : null,
        url: typeof url === "string" ? url : null,
      },
    ];
  });
}

/** Base URL for every Jira Cloud REST call made with a 3LO token. */
export function jiraApiBase(cloudId: string): string {
  return `https://api.atlassian.com/ex/jira/${cloudId}`;
}
