import { ApprovalGate } from "@/components/gates/ApprovalGate";
import { getFeatureGates } from "@/server/db";
import { requireMember } from "@/lib/auth/session";

export default async function DonatePage() { await requireMember(); const gates = await getFeatureGates(); return <ApprovalGate eyebrow="Member · donation" title={gates.payments_live ? "Payment launch verification is still pending." : "Online donation checkout is not active yet."} summary="Every donation will remain linked to your authenticated Member record, and public recognition will always use your saved display preference. Guest checkout is not available." requirements={["Merchant onboarding and approved payment scope", "Razorpay test-mode order and webhook verification", "Reconciliation ownership and receipt wording review", "A4 staged-donation and finance approval"]} primaryHref="/my-donations" primaryLabel="Return to Member dashboard" />; }
