import { NextRequest, NextResponse } from "next/server";
import { allowsDeploymentPath, getBackendOrigin, getDeploymentSurface, isLocalAuthenticationPath } from "@/lib/deployment/surface";

const protectedPrefixes = ["/donate", "/my-donations", "/profile", "/feed", "/chat", "/voting", "/admin"];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const surface = getDeploymentSurface();
  if (!allowsDeploymentPath(surface, pathname)) {
    if (pathname === "/api" || pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "deployment_surface_not_found" }, { status: 404 });
    }
    return new NextResponse("Not Found", { status: 404 });
  }
  const isApiRequest = pathname === "/api" || pathname.startsWith("/api/");
  if (surface !== "api" && isApiRequest && !isLocalAuthenticationPath(pathname)) {
    const backendOrigin = getBackendOrigin();
    if (!backendOrigin) {
      return NextResponse.json({ error: "backend_service_not_configured" }, { status: 503 });
    }
    const backendUrl = new URL(`${pathname}${request.nextUrl.search}`, backendOrigin);
    return NextResponse.rewrite(backendUrl);
  }
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

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"] };
