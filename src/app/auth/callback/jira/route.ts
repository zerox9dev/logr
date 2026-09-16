import { NextResponse, type NextRequest } from "next/server";
import { getAuthedPb } from "@/lib/pocketbase-server";
import { filterValue } from "@/lib/pocketbase";
import {
  INTEGRATIONS_PATH,
  JIRA_STATE_COOKIE,
  atlassianCredentials,
  exchangeCode,
  fetchAccessibleResources,
  integrationsUrl,
  jiraApiBase,
  parseJiraState,
  resolveOrigin,
  safeNext,
} from "@/lib/atlassian-oauth";

/** The connected Atlassian account, for display and for keeping the sync to
 *  this user's own worklogs. Failing here is not fatal — the connection still
 *  works, it just shows no email. */
async function fetchJiraSelf(
  cloudId: string,
  accessToken: string,
): Promise<{ accountId: string; email: string }> {
  try {
    const response = await fetch(`${jiraApiBase(cloudId)}/rest/api/3/myself`, {
      headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
      cache: "no-store",
    });
    if (!response.ok) return { accountId: "", email: "" };
    const body = (await response.json()) as Record<string, unknown>;
    return {
      accountId: typeof body.accountId === "string" ? body.accountId : "",
      email: typeof body.emailAddress === "string" ? body.emailAddress : "",
    };
  } catch {
    return { accountId: "", email: "" };
  }
}

/** Atlassian's redirect target. Exchanges the code for tokens server-side and
 *  stores them against the signed-in logr user — the browser never sees them. */
export async function GET(request: NextRequest) {
  const origin = resolveOrigin(request);
  const params = request.nextUrl.searchParams;
  const stored = parseJiraState(request.cookies.get(JIRA_STATE_COOKIE)?.value);
  const next = safeNext(stored?.next);

  const finish = (url: URL) => {
    const response = NextResponse.redirect(url);
    response.cookies.delete(JIRA_STATE_COOKIE);
    return response;
  };
  const fail = (error: "denied" | "failed" | "unavailable") =>
    finish(integrationsUrl(origin, { error }, next));

  if (params.get("error")) return fail("denied");

  const code = params.get("code");
  const state = params.get("state");
  if (!code || !state || !stored || state !== stored.state) return fail("failed");

  const credentials = atlassianCredentials();
  if (!credentials) return fail("unavailable");

  let pb;
  let userId;
  try {
    ({ pb, userId } = await getAuthedPb());
  } catch {
    const login = new URL("/login", origin);
    login.searchParams.set("next", next ?? INTEGRATIONS_PATH);
    return finish(login);
  }

  const tokens = await exchangeCode(credentials, code, origin);
  if (!tokens || !tokens.refreshToken) return fail("failed");

  const [site] = await fetchAccessibleResources(tokens.accessToken);
  if (!site) return fail("failed");

  const self = await fetchJiraSelf(site.id, tokens.accessToken);

  const payload = {
    user: userId,
    cloud_id: site.id,
    site_name: site.name ?? "",
    site_url: site.url ?? "",
    atlassian_email: self.email,
    atlassian_account_id: self.accountId,
    access_token: tokens.accessToken,
    refresh_token: tokens.refreshToken,
    token_expires_at: tokens.expiresAt,
  };

  try {
    const existing = await pb
      .collection("jira_connections")
      .getFirstListItem(`user = "${filterValue(userId)}"`)
      .catch(() => null);
    if (existing) {
      await pb.collection("jira_connections").update(existing.id, payload);
    } else {
      await pb.collection("jira_connections").create(payload);
    }
  } catch {
    return fail("failed");
  }

  return finish(integrationsUrl(origin, { connected: true }, next));
}
