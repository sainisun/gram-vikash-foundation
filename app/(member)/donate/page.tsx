import { getFeatureGates } from "@/server/db";
import { requireMember } from "@/lib/auth/session";

export default async function DonatePage() {
  await requireMember();
  const gates = await getFeatureGates();
  return <main className="main"><p className="eyebrow">Member · donation</p><h1>Donate from your verified Member record.</h1><section className="ledger"><p>Donation ownership and any public donor-wall preference are derived from your authenticated Member profile. Guest checkout is not available.</p><section className="gate"><strong>Live payment: {gates.payments_live ? "approval pending" : "not active"}</strong><p>Razorpay checkout will remain unavailable until merchant onboarding, webhook verification, reconciliation ownership, finance approval, and the documented launch gate are complete.</p></section></section></main>;
}
