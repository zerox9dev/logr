import { NextResponse, type NextRequest } from "next/server";
import { getAuthedPb } from "@/lib/pocketbase-server";
import { jiraApiBase } from "@/lib/atlassian-oauth";
import { findJiraConnection, validAccessToken } from "@/lib/jira-server";

// Jira project avatars are not public images: the URLs Jira hands out in
// `avatarUrls` answer 401 without the same OAuth bearer token the rest of the
// integration uses, and the browser has none. So the image is fetched here,
// server-side, and streamed back — the access token stays on the server, as it
// does everywhere else in this feature.

export const runtime = "nodejs";

/** Per-viewer and short enough that a changed project avatar shows up the same
 *  day, long enough that a page of mapping rows is one request each. */
const CACHE_CONTROL = "private, max-age=3600";

export async function GET(request: NextRequest) {
  const target = request.nextUrl.searchParams.get("url");
  if (!target) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  let pb, userId: string;
  try {
    ({ pb, userId } = await getAuthedPb());
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const connection = await findJiraConnection(pb, userId);
  if (!connection) return NextResponse.json({ error: "not_connected" }, { status: 404 });

  // The URL comes from the client, so it is confined to an avatar path on this
  // user's own Jira site — otherwise this route would be an authenticated
  // fetch proxy for arbitrary addresses.
  const base = `${jiraApiBase(connection.cloud_id)}/`;
  const allowed =
    target.startsWith(base) && /avatar/i.test(new URL(target).pathname);
  if (!allowed) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  const token = await validAccessToken(pb, connection);
  const response = await fetch(target, {
    headers: { Authorization: `Bearer ${token}`, Accept: "image/*" },
    cache: "no-store",
  });

  const contentType = response.headers.get("content-type") ?? "";
  if (!response.ok || !response.body || !contentType.startsWith("image/")) {
    return NextResponse.json({ error: "unavailable" }, { status: 502 });
  }

  return new NextResponse(response.body, {
    headers: { "Content-Type": contentType, "Cache-Control": CACHE_CONTROL },
  });
}
