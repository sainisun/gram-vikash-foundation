import { createHmac, timingSafeEqual } from "node:crypto";

export type ReconciliationDecision = "ignore" | "mark_successful" | "investigate";

export function verifyRazorpayWebhookSignature(rawBody: string, suppliedSignature: string | undefined, webhookSecret: string | undefined) {
  if (!suppliedSignature || !webhookSecret) return false;
  const expected = createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
  const expectedBuffer = Buffer.from(expected, "utf8");
  const suppliedBuffer = Buffer.from(suppliedSignature, "utf8");
  return expectedBuffer.length === suppliedBuffer.length && timingSafeEqual(expectedBuffer, suppliedBuffer);
}

export function reconciliationDecision(input: { paymentStatus: "captured" | "failed" | "pending"; donationStatus: "pending" | "successful" | "failed" | "reversed"; eventSeen: boolean }): ReconciliationDecision {
  if (input.eventSeen) return "ignore";
  if (input.paymentStatus === "captured" && input.donationStatus === "pending") return "mark_successful";
  return "investigate";
}

export function receiptWorkflowStatus(paymentsLive: boolean) {
  return paymentsLive
    ? "Receipt generation requires an approved sender, template, reconciliation record, and delivery audit event."
    : "Receipt generation is disabled until the live payment gate is approved.";
}
