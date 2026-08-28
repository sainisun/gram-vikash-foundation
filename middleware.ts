import { NextRequest, NextResponse } from "next/server";
import { allowsDeploymentPath, getBackendOrigin, getDeploymentSurface, isLocalAuthenticationPath } from "@/lib/deployment/surface";

const protectedPrefixes = ["/donate", "/my-donations", "/profile", "/feed", "/chat", "/voting", "/admin"];

export function hasSupabaseAuthCookie(request: NextRequest) {
  return request.cookies.getAll().some(({ name }) => /^sb-.+-auth-token(?:\.\d+)?$/.test(name));
}

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
  // Supabase SSR cookies provide the early session boundary; the server session helper
  // still verifies the token and role before rendering protected data or mutating state.
  if (hasSupabaseAuthCookie(request)) return NextResponse.next();
  const url = request.nextUrl.clone();
  url.pathname = "/access-required";
  url.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"] };
