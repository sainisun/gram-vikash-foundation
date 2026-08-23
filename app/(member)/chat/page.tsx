import { ApprovalGate } from "@/components/gates/ApprovalGate";
import { requireMember } from "@/lib/auth/session";

export default async function ChatPage() { await requireMember(); return <ApprovalGate eyebrow="Member · group chat" title="Group chat requires a monitored pilot." summary="A real-time conversation tool is not a simple messaging feature. It needs persistent moderation, rate limits, incident handling, and an explicit outage plan before it can be opened." requirements={["Community posting pilot has been reviewed", "Moderator tools and audit access are operational", "Rate-limit and report workflows are tested", "Outage and child-safety escalation paths are assigned"]} primaryHref="/feed" primaryLabel="View community readiness" />; }
