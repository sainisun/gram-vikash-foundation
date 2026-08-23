import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "../middleware";

describe("Next route middleware", () => {
  it("redirects unauthenticated visitors away from protected Member routes", () => {
    const response = middleware(new NextRequest("https://foundation.test/donate"));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/access-required");
  });

  it("allows a request carrying the managed session cookie to reach protected routes", () => {
    const response = middleware(new NextRequest("https://foundation.test/feed", { headers: { cookie: "app_session_id=test-session" } }));
    expect(response.headers.get("location")).toBeNull();
  });
});
