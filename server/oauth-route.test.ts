import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { GET as startLogin } from "../app/api/oauth/start/route";
import { GET as callback } from "../app/api/oauth/callback/route";

describe("Next OAuth bridge", () => {
  it("rejects a login start request without an explicit same-origin value", async () => {
    const response = await startLogin(new NextRequest("https://foundation.test/api/oauth/start"));
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "invalid_origin" });
  });

  it("rejects a callback that omits the code or state before token exchange", async () => {
    const response = await callback(new NextRequest("https://foundation.test/api/oauth/callback"));
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "code_and_state_required" });
  });
});
