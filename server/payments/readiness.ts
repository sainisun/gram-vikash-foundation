const requiredLivePaymentVariables = ["RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET", "RAZORPAY_WEBHOOK_SECRET"] as const;

export type PaymentReadiness = {
  enabled: boolean;
  missing: readonly string[];
  reason: string;
};

export function getPaymentReadiness(environment: Record<string, string | undefined>, paymentsLiveFlag: boolean): PaymentReadiness {
  const missing = requiredLivePaymentVariables.filter(key => !environment[key]?.trim());
  if (!paymentsLiveFlag) {
    return { enabled: false, missing, reason: "Live payments are disabled by the server-controlled payments_live gate." };
  }
  if (missing.length) {
    return { enabled: false, missing, reason: "Live payments require approved server-side Razorpay credentials and webhook verification." };
  }
  return { enabled: true, missing: [], reason: "Payment prerequisites are configured. Production activation still requires documented finance approval." };
}
