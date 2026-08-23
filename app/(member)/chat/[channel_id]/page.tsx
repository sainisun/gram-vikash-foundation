import { ApprovalGate } from "@/components/gates/ApprovalGate";
import { requireMember } from "@/lib/auth/session";

export default async function ChannelPage({ params }: { params: Promise<{ channel_id: string }> }) { await requireMember(); const { channel_id } = await params; return <ApprovalGate eyebrow={`Member · channel ${channel_id}`} title="This chat channel is not active." summary="Channel access is blocked because group chat requires the same moderation, safeguarding, rate-limit, and outage-response safeguards as the broader community pilot." requirements={["Community pilot and moderator coverage", "Rate-limit and report workflow tests", "Safeguarding and incident escalation", "Recorded human go/no-go decision"]} primaryHref="/chat" primaryLabel="View group-chat readiness" />; }
