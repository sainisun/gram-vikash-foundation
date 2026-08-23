import { ApprovalGate } from "@/components/gates/ApprovalGate";
import { requireMember } from "@/lib/auth/session";

export default async function VerifyVoterPage() { await requireMember(); return <ApprovalGate eyebrow="Member · voter verification" title="Voter-document review is intentionally closed." summary="No government ID document is requested or stored until the foundation approves a restricted workflow, retention period, accepted documents, and safe alternative for eligible Members without approved ID." requirements={["Accepted document types and age policy", "Restricted upload, encryption, and retention controls", "Named reviewers and escalation path", "Approved alternative for an eligible Member without ID"]} primaryHref="/voting" primaryLabel="View voting readiness" />; }
