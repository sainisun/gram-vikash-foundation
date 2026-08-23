import { describe, expect, it } from "vitest";
import nextConfig from "../next.config";

describe("Next runtime configuration", () => {
  it("allows only the local development hosts used during preview validation", () => {
    expect(nextConfig.allowedDevOrigins).toEqual([
      "127.0.0.1",
      "localhost",
      "**.manus.computer",
    ]);
  });

  it("retains the baseline security headers", async () => {
    const headers = await nextConfig.headers?.();
    const globalHeaders = headers?.find((entry) => entry.source === "/(.*)")?.headers;

    expect(globalHeaders).toEqual(expect.arrayContaining([
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    ]));
  });
});
