import { NextResponse, type NextRequest } from "next/server";
import { PB_AUTH_COOKIE, createPb, loadAuthCookie } from "@/lib/pocketbase";

// UX gate only: it keeps signed-out visitors from landing on an empty dashboard.
// Real enforcement lives in PocketBase's API Rules, which validate the token
// server-side on every query — the same trust boundary Postgres RLS provided.
export async function proxy(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/app")) return NextResponse.next();

  const pb = createPb();
  loadAuthCookie(pb, request.cookies.get(PB_AUTH_COOKIE)?.value);
  if (pb.authStore.isValid) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = "/login";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/app/:path*"],
};
