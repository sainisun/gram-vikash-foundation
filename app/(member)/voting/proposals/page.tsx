import { requireMember } from "@/lib/auth/session";

export default async function VotingProposalsPage() {
  await requireMember();
  return <main className="main"><p className="eyebrow">Member · proposals</p><h1>Community proposals are not active.</h1><section className="gate">Proposal submission and upvoting remain feature-gated with the community and moderation controls.</section></main>;
}
