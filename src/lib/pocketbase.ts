import PocketBase from "pocketbase";

/** PocketBase base URL. Server-only: the browser never talks to PocketBase
 *  directly, so this may be an internal hostname with no public DNS. */
export const pocketbaseUrl = process.env.POCKETBASE_URL || "http://127.0.0.1:8090";

/** Cookie PocketBase's `authStore.exportToCookie()` writes by default. */
export const PB_AUTH_COOKIE = "pb_auth";

export interface PbUser {
  id: string;
  email: string;
  name: string | null;
}

/** A fresh, request-scoped PocketBase client. Never share one across requests:
 *  `authStore` is per-instance state and would leak between users. */
export function createPb(): PocketBase {
  const pb = new PocketBase(pocketbaseUrl);
  pb.autoCancellation(false);
  return pb;
}

/** Loads the session the browser holds into `pb.authStore`. */
export function loadAuthCookie(pb: PocketBase, rawCookieValue: string | undefined): void {
  if (!rawCookieValue) return;
  pb.authStore.loadFromCookie(`${PB_AUTH_COOKIE}=${rawCookieValue}`, PB_AUTH_COOKIE);
}

export function toPbUser(model: Record<string, unknown> | null): PbUser | null {
  if (!model || typeof model.id !== "string") return null;
  return {
    id: model.id,
    email: typeof model.email === "string" ? model.email : "",
    name: typeof model.name === "string" && model.name ? model.name : null,
  };
}

/** Escapes a value for interpolation into a PocketBase filter expression. */
export function filterValue(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}
