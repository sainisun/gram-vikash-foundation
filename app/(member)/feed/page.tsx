import { requireMember } from "@/lib/auth/session";

export default async function FeedPage() {
  await requireMember();
  return <main className="main"><p className="eyebrow">Member · community</p><h1>Community features are intentionally gated.</h1><section className="gate">Posts, comments, reports, and group chat require a named moderation owner, Grievance Officer process, safeguarding escalation, retention controls, and a human go/no-go decision.</section></main>;
}
