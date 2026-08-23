import Link from "next/link";
import { requireManagedUser } from "@/lib/auth/session";

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  const user = await requireManagedUser();
  return <div className="workspace"><aside className="workspace-aside"><div><p className="eyebrow">Member workspace</p><h2>{user.name ?? "Your Member record"}</h2><p>Keep your public-display preference and contact record accurate.</p></div><nav className="workspace-links" aria-label="Member navigation"><Link href="/my-donations">Overview</Link><Link href="/profile">Profile & verification</Link><Link href="/donate">Donate</Link><span className="nav-gated">Community · gated</span><span className="nav-gated">Voting · gated</span></nav><Link href="/" className="workspace-back">← Return to public ledger</Link></aside><section className="workspace-content">{children}</section></div>;
}
