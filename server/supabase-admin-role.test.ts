import { afterEach, describe, expect, it, vi } from "vitest";
import { isConfiguredAdminEmail } from "./db";

describe("Supabase administrator email mapping", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("normalizes the configured comma-separated allowlist", () => {
    vi.stubEnv("GVF_ADMIN_EMAILS", " admin@example.org,Owner@example.org ");
    expect(isConfiguredAdminEmail("ADMIN@example.org")).toBe(true);
    expect(isConfiguredAdminEmail("owner@example.org")).toBe(true);
    expect(isConfiguredAdminEmail("other@example.org")).toBe(false);
    expect(isConfiguredAdminEmail(null)).toBe(false);
  });
});
