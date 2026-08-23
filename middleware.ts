import { NextRequest, NextResponse } from "next/server";

const protectedPrefixes = ["/donate", "/my-donations", "/profile", "/feed", "/chat", "/voting", "/admin"];

export function middleware(request: NextRequest) {
  const requiresSession = protectedPrefixes.some(prefix => request.nextUrl.pathname === prefix || request.nextUrl.pathname.startsWith(`${prefix}/`));
  if (!requiresSession) return NextResponse.next();
  // The legacy managed-auth bridge sets `app_session_id`. Full token validation remains
  // server-side work; this middleware provides only an early redirect boundary.
  if (request.cookies.has("app_session_id")) return NextResponse.next();
  const url = request.nextUrl.clone();
  url.pathname = "/access-required";
  url.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/donate/:path*", "/my-donations/:path*", "/profile/:path*", "/feed/:path*", "/chat/:path*", "/voting/:path*", "/admin/:path*"] };
