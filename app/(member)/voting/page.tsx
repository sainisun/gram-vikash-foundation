import { ApprovalGate } from "@/components/gates/ApprovalGate";
import { requireMember } from "@/lib/auth/session";

export default async function VotingPage() { await requireMember(); return <ApprovalGate eyebrow="Member · voting" title="Voting is not open for this Member yet." summary="Voting starts only after the community pilot, document-verification policy, ballot-secrecy rules, and governance process have been approved and tested." requirements={["Community moderation pilot evidence", "Approved voter-document and ID-less handling policy", "Verified Voter reviewer workflow", "Official issue, anomaly, and ballot-secrecy procedures"]} primaryHref="/profile/verify-voter" primaryLabel="View verification readiness" />; }
