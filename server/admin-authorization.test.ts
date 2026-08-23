import { beforeEach, describe, expect, it, vi } from "vitest";

const { authenticateRequest, redirect } = vi.hoisted(() => ({
  authenticateRequest: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(async () => new Headers()),
}));

vi.mock("next/navigation", () => ({ redirect }));
vi.mock("@/server/_core/sdk", () => ({ sdk: { authenticateRequest } }));
vi.mock("@/server/db", () => ({ getMemberByUserId: vi.fn() }));

import { requireManagedAdmin } from "@/lib/auth/session";

describe("administrative authorization", () => {
  beforeEach(() => {
    authenticateRequest.mockReset();
    redirect.mockReset();
    redirect.mockImplementation(() => {
      throw new Error("redirected");
    });
  });

  it("redirects an authenticated non-admin user away from an administrative guard", async () => {
    authenticateRequest.mockResolvedValue({ id: 27, role: "member" });

    await expect(requireManagedAdmin()).rejects.toThrow("redirected");
    expect(redirect).toHaveBeenCalledWith("/access-required");
  });
});
