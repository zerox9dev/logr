import type PocketBase from "pocketbase";
import { cookies } from "next/headers";
import { PB_AUTH_COOKIE, createPb, loadAuthCookie, toPbUser, type PbUser } from "@/lib/pocketbase";

/** PocketBase client with the session loaded from the request cookie.
 *  Safe in Server Components, Route Handlers and Server Actions. */
export async function getPb(): Promise<PocketBase> {
  const pb = createPb();
  const cookieStore = await cookies();
  loadAuthCookie(pb, cookieStore.get(PB_AUTH_COOKIE)?.value);
  return pb;
}

/** Current user, or null when signed out or the session has expired. */
export async function getCurrentUser(): Promise<PbUser | null> {
  const pb = await getPb();
  if (!pb.authStore.isValid) return null;
  return toPbUser(pb.authStore.record as Record<string, unknown> | null);
}

/** Authenticated client + user id for the data layer. Throws when signed out —
 *  callers all sit behind a route that already redirects or 401s anonymous users. */
export async function getAuthedPb(): Promise<{ pb: PocketBase; userId: string }> {
  const pb = await getPb();
  const user = toPbUser(pb.authStore.record as Record<string, unknown> | null);
  if (!pb.authStore.isValid || !user) throw new Error("Not authenticated");
  return { pb, userId: user.id };
}
