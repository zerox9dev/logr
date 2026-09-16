import type PocketBase from "pocketbase";
import { filterValue } from "@/lib/pocketbase";
import { TOKEN_EXPIRY_BUFFER_MS, atlassianCredentials, refreshTokens } from "@/lib/atlassian-oauth";
import { toJiraConnectionRow } from "@/lib/pocketbase-mappers";
import type { JiraConnection } from "@/types/database";

// Server-only access to the stored Jira credential. Lives outside the Server
// Action module so the avatar route handler can reuse it: everything exported
// from a `"use server"` file becomes a callable action, which a helper taking a
// PocketBase client must not be.

export async function findJiraConnection(
  pb: PocketBase,
  userId: string,
): Promise<JiraConnection | null> {
  try {
    const record = await pb
      .collection("jira_connections")
      .getFirstListItem(`user = "${filterValue(userId)}"`);
    return toJiraConnectionRow(record);
  } catch {
    return null;
  }
}

/** Current access token, refreshed in place when it is at or near expiry.
 *  Atlassian rotates the refresh token on every use, so both are rewritten. */
export async function validAccessToken(
  pb: PocketBase,
  connection: JiraConnection,
): Promise<string> {
  const expiresAt = connection.token_expires_at ? Date.parse(connection.token_expires_at) : 0;
  if (expiresAt - TOKEN_EXPIRY_BUFFER_MS > Date.now()) return connection.access_token;

  const credentials = atlassianCredentials();
  if (!credentials) throw new Error("Jira integration is not configured");

  const tokens = await refreshTokens(credentials, connection.refresh_token);
  if (!tokens) throw new Error("Jira session expired — reconnect the integration");

  await pb.collection("jira_connections").update(connection.id, {
    access_token: tokens.accessToken,
    refresh_token: tokens.refreshToken,
    token_expires_at: tokens.expiresAt,
  });
  return tokens.accessToken;
}
