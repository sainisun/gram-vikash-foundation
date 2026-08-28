import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { POST as requestMagicLink } from "../app/api/auth/magic-link/route";
import { GET as confirmMagicLink } from "../app/auth/confirm/route";
import { POST as logout } from "../app/api/auth/logout/route";

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(),
}));

const mockedClientFactory = vi.mocked(createSupabaseServerClient);

describe("Supabase Magic Link authentication", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects malformed email input before contacting Supabase", async () => {
    const response = await requestMagicLink(new NextRequest("https://public.example/api/auth/magic-link", { method: "POST", body: JSON.stringify({ email: "not-an-email" }) }));
    expect(response.status).toBe(400);
    expect(mockedClientFactory).not.toHaveBeenCalled();
  });

  it("requests a Magic Link with a same-origin confirmation URL", async () => {
    const signInWithOtp = vi.fn().mockResolvedValue({ error: null });
    mockedClientFactory.mockResolvedValue({ auth: { signInWithOtp, verifyOtp: vi.fn().mockResolvedValue({ error: new Error("invalid token") }) } } as never);
    const response = await requestMagicLink(new NextRequest("https://public.example/api/auth/magic-link", { method: "POST", body: JSON.stringify({ email: "Member@Example.com", next: "//evil.example" }) }));
    expect(response.status).toBe(200);
    expect(signInWithOtp).toHaveBeenCalledWith({
      email: "member@example.com",
      options: { shouldCreateUser: true, emailRedirectTo: "https://public.example/auth/confirm?next=%2Fmy-donations" },
    });
  });

  it("confirms a valid Magic Link and preserves a safe return path", async () => {
    const verifyOtp = vi.fn().mockResolvedValue({ data: { user: { id: "supabase-user-7" } }, error: null });
    mockedClientFactory.mockResolvedValue({ auth: { verifyOtp } } as never);
    const response = await confirmMagicLink(new NextRequest("https://admin.example/auth/confirm?token_hash=valid&type=email&next=%2Fadmin"));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://admin.example/admin");
    expect(verifyOtp).toHaveBeenCalledWith({ type: "email", token_hash: "valid" });
  });

  it("returns a safe login error when confirmation is missing or invalid", async () => {
    const verifyOtp = vi.fn().mockResolvedValue({ data: { user: null }, error: new Error("invalid token") });
    mockedClientFactory.mockResolvedValue({ auth: { verifyOtp } } as never);
    const response = await confirmMagicLink(new NextRequest("https://public.example/auth/confirm?token_hash=bad&type=email&next=%2F%2Fevil.example"));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/login?error=confirmation_failed");
  });

  it("fails closed when the Supabase Auth configuration is unavailable", async () => {
    mockedClientFactory.mockRejectedValue(new Error("missing configuration"));
    const response = await requestMagicLink(new NextRequest("https://public.example/api/auth/magic-link", { method: "POST", body: JSON.stringify({ email: "member@example.org" }) }));
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ error: "auth_not_configured" });
  });

  it("keeps sign-out on the current host even when Supabase sign-out fails", async () => {
    const signOut = vi.fn().mockRejectedValue(new Error("temporary"));
    mockedClientFactory.mockResolvedValue({ auth: { signOut } } as never);
    const response = await logout(new Request("https://admin.example/api/auth/logout", { method: "POST" }));
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("https://admin.example/");
    expect(signOut).toHaveBeenCalledOnce();
  });
});
