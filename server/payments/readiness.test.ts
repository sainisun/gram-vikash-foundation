import { describe, expect, it } from "vitest";
import { getPaymentReadiness } from "./readiness";

describe("payment readiness gate", () => {
  it("stays disabled without the server-controlled payment flag", () => {
    expect(getPaymentReadiness({ RAZORPAY_KEY_ID: "key", RAZORPAY_KEY_SECRET: "secret", RAZORPAY_WEBHOOK_SECRET: "webhook" }, false).enabled).toBe(false);
  });

  it("stays disabled when a required secret is absent", () => {
    const readiness = getPaymentReadiness({ RAZORPAY_KEY_ID: "key" }, true);
    expect(readiness.enabled).toBe(false);
    expect(readiness.missing).toContain("RAZORPAY_KEY_SECRET");
  });

  it("reports readiness only when the flag and all server-side credentials are present", () => {
    expect(getPaymentReadiness({ RAZORPAY_KEY_ID: "key", RAZORPAY_KEY_SECRET: "secret", RAZORPAY_WEBHOOK_SECRET: "webhook" }, true).enabled).toBe(true);
  });
});
