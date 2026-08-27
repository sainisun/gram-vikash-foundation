import Link from "next/link";
import { requireManagedAdmin } from "@/lib/auth/session";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireManagedAdmin();
  const publicSiteUrl = process.env.NEXT_PUBLIC_PUBLIC_SITE_URL?.replace(/\/$/, "");
  const publicLedgerHref = publicSiteUrl ? `${publicSiteUrl}/ledger` : "/ledger";
  return <div className="workspace admin-workspace"><aside className="workspace-aside"><div><p className="eyebrow">Admin operations</p><h2>{admin.name ?? "Foundation administrator"}</h2><p>Financial actions are restricted, source-backed, and auditable.</p></div><nav className="workspace-links" aria-label="Administrative navigation"><Link href="/admin">Operations overview</Link><Link href="/admin/readiness">Release readiness</Link><Link href="/admin/expenses">Expenses</Link><Link href="/admin/donations/offline">Offline donations</Link><Link href="/admin/programs">Programs</Link><Link href="/admin/ledger">Ledger review</Link><Link href="/admin/exports">Controlled exports</Link><Link href="/admin/audit-log">Audit evidence</Link><Link href="/admin/receipts">Receipt readiness</Link><span className="nav-gated">Moderation · gated</span><span className="nav-gated">Voter review · gated</span></nav><Link href={publicLedgerHref} className="workspace-back">← Return to public ledger</Link></aside><section className="workspace-content">{children}</section></div>;
}
