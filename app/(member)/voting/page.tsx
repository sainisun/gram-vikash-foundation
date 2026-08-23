import { requireMember } from "@/lib/auth/session";

export default async function VotingPage() { await requireMember(); return <main className="main"><p className="eyebrow">Village voting</p><h1>Voting is not active.</h1><div className="gate">Voting requires a successful community pilot, restricted voter-verification workflow, approved governance rules, and human sign-off before implementation is activated.</div></main>; }
