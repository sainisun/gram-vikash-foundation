export default async function VotingIssuePage({ params }: { params: Promise<{ issue_id: string }> }) {
  const { requireMember } = await import("@/lib/auth/session");
  await requireMember();
  const { issue_id } = await params;
  return <main className="main"><p className="eyebrow">Member · voting issue {issue_id}</p><h1>Voting is not active.</h1><section className="gate">Votes require an approved verification workflow, verified-voter server check, immutable ballot integrity controls, and governance approval.</section></main>;
}
