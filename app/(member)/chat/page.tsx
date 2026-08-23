import { requireMember } from "@/lib/auth/session";

export default async function ChatPage() {
  await requireMember();
  return <main className="main"><p className="eyebrow">Member · group chat</p><h1>Group chat is not active.</h1><section className="gate">The chat service remains disabled until moderation, safeguarding, retention, and operational ownership are approved.</section></main>;
}
