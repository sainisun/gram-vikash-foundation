import { describe, expect, it } from "vitest";

describe("Supabase production configuration", () => {
  it("accepts the configured project URL and publishable key", async () => {
    const projectUrl = process.env.SUPABASE_URL;
    const publishableKey = process.env.SUPABASE_KEY;
    expect(projectUrl).toMatch(/^https:\/\//);
    expect(publishableKey).toBeTruthy();

    const response = await fetch(`${projectUrl}/auth/v1/health`, {
      headers: { apikey: publishableKey as string },
    });
    expect(response.ok).toBe(true);
  }, 15_000);
});
