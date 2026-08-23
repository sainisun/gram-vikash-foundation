import { ApprovalGate } from "@/components/gates/ApprovalGate";
import { requireMember } from "@/lib/auth/session";

export default async function FeedPage() { await requireMember(); return <ApprovalGate eyebrow="Member · community" title="Community space is not open yet." summary="Posts, comments, reports, and group chat are intentionally unavailable until the foundation has the operating safeguards to respond to real people safely." requirements={["Named moderation owner and backup coverage", "Published Grievance Officer process", "Safeguarding escalation contacts", "Approved privacy, retention, and removal process"]} primaryHref="/trust" primaryLabel="See the community activation boundary" />; }
