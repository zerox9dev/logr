import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const lang = pathname.startsWith("/ru") ? "ru" : pathname.startsWith("/uk") ? "uk" : "en";
  const response = NextResponse.next();
  response.headers.set("x-lang", lang);
  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.svg|.*\\.ico).*)"],
};
