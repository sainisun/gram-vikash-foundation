import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { reconciliationDecision, receiptWorkflowStatus, verifyRazorpayWebhookSignature } from "./webhook";

describe("Razorpay payment workflow scaffolding", () => {
  it("accepts only a matching raw-body HMAC signature", () => {
    const rawBody = '{"event":"payment.captured"}';
    const secret = "test-secret";
    const signature = createHmac("sha256", secret).update(rawBody).digest("hex");
    expect(verifyRazorpayWebhookSignature(rawBody, signature, secret)).toBe(true);
    expect(verifyRazorpayWebhookSignature(rawBody, "incorrect", secret)).toBe(false);
  });

  it("keeps duplicate and unexpected reconciliation events out of automatic success transitions", () => {
    expect(reconciliationDecision({ paymentStatus: "captured", donationStatus: "pending", eventSeen: false })).toBe("mark_successful");
    expect(reconciliationDecision({ paymentStatus: "captured", donationStatus: "pending", eventSeen: true })).toBe("ignore");
    expect(reconciliationDecision({ paymentStatus: "failed", donationStatus: "pending", eventSeen: false })).toBe("investigate");
  });

  it("keeps receipt generation unavailable before the payment gate opens", () => {
    expect(receiptWorkflowStatus(false)).toContain("disabled");
  });
});
