import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "../middleware";

describe("Next route middleware", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("redirects unauthenticated visitors away from protected Member routes", () => {
    const response = middleware(new NextRequest("https://foundation.test/donate"));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/access-required");
  });

  it("allows a request carrying the managed session cookie to reach protected routes", () => {
    const response = middleware(new NextRequest("https://foundation.test/feed", { headers: { cookie: "app_session_id=test-session" } }));
    expect(response.headers.get("location")).toBeNull();
  });

  it("keeps administrative pages and administrative APIs off the public deployment surface", () => {
    vi.stubEnv("GVF_DEPLOYMENT_SURFACE", "public");
    expect(middleware(new NextRequest("https://foundation.test/programs")).status).toBe(200);
    expect(middleware(new NextRequest("https://foundation.test/admin/readiness")).status).toBe(404);
    expect(middleware(new NextRequest("https://foundation.test/api/admin/readiness")).status).toBe(404);
  });

  it("limits the administrative deployment surface to its workspace and sign-in endpoints", () => {
    vi.stubEnv("GVF_DEPLOYMENT_SURFACE", "admin");
    expect(middleware(new NextRequest("https://foundation.test/admin/readiness", { headers: { cookie: "app_session_id=test-session" } })).status).toBe(200);
    expect(middleware(new NextRequest("https://foundation.test/access-required")).status).toBe(200);
    expect(middleware(new NextRequest("https://foundation.test/programs")).status).toBe(404);
  });

  it("limits the API deployment surface to API routes", () => {
    vi.stubEnv("GVF_DEPLOYMENT_SURFACE", "api");
    expect(middleware(new NextRequest("https://foundation.test/api/summary")).status).toBe(200);
    expect(middleware(new NextRequest("https://foundation.test/")).status).toBe(404);
  });

  it("rewrites frontend API requests to the configured backend service", () => {
    vi.stubEnv("GVF_DEPLOYMENT_SURFACE", "public");
    vi.stubEnv("GVF_API_ORIGIN", "https://gvf-api.vercel.app/");
    const response = middleware(new NextRequest("https://foundation.test/api/summary?fresh=1"));
    expect(response.headers.get("x-middleware-rewrite")).toBe("https://gvf-api.vercel.app/api/summary?fresh=1");
  });

  it("fails closed when a frontend API request has no configured backend origin", () => {
    vi.stubEnv("GVF_DEPLOYMENT_SURFACE", "public");
    const response = middleware(new NextRequest("https://foundation.test/api/summary"));
    expect(response.status).toBe(503);
  });

  it("keeps host-specific OAuth entrypoints local to the frontend service", () => {
    vi.stubEnv("GVF_DEPLOYMENT_SURFACE", "admin");
    vi.stubEnv("GVF_API_ORIGIN", "https://gvf-api.vercel.app");
    const response = middleware(new NextRequest("https://foundation.test/api/oauth/start"));
    expect(response.headers.get("x-middleware-rewrite")).toBeNull();
  });
});
