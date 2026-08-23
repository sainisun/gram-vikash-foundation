import { requireMember } from "@/lib/auth/session";

export default async function VerifyVoterPage() {
  await requireMember();
  return <main className="main"><p className="eyebrow">Member · voter verification</p><h1>Voter verification is not active.</h1><section className="gate">No government-ID upload or review is available until the restricted-document, retention, reviewer, and governance approvals open the server-controlled feature gate.</section></main>;
}
