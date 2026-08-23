import { ApprovalGate } from "@/components/gates/ApprovalGate";
import { requireMember } from "@/lib/auth/session";

export default async function VotingProposalsPage() { await requireMember(); return <ApprovalGate eyebrow="Member · proposals" title="Proposal activity is not open yet." summary="The platform will not collect proposals or upvotes until moderation, rate limits, the trending rule, and the official-issue governance process are approved." requirements={["Approved proposal and trending rule", "Moderated rate-limited proposal workflow", "Community pilot evidence", "Founder and architect voting-governance sign-off"]} primaryHref="/voting" primaryLabel="View voting readiness" />; }
