import Link from "next/link";
import { getPublicTransparencySnapshot } from "@/server/db";

const inr = (paise: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(paise / 100);
const workstreams = [
  ["Record funds", "Add expense", "Capture a reviewed, public-safe expense entry.", "/admin/expenses"],
  ["Record funds", "Offline donation", "Attach a cash or cheque record to an existing Member.", "/admin/donations/offline"],
  ["Publish evidence", "Programs", "Create, publish, edit, or retire public program information.", "/admin/programs"],
  ["Verify trail", "Ledger review", "Check the public financial projection before it is relied upon.", "/admin/ledger"],
  ["Verify trail", "Audit evidence", "Review protected administrator action history.", "/admin/audit-log"],
  ["Controlled output", "Exports", "Prepare minimized, audit-backed CSV exports.", "/admin/exports"],
] as const;

export default async function AdminDashboard() {
  const summary = await getPublicTransparencySnapshot();
  return <main className="dashboard-page admin-dashboard"><header className="dashboard-heading"><p className="eyebrow">Protected administration</p><div className="record-id">OPERATOR CONSOLE / AUDITED ACTIONS</div><h1>Record the work. Preserve the trail.</h1><p>This workspace is for reviewable operational actions. Public totals update from successful source entries; no administrator manually edits the displayed balance.</p></header><section className="member-snapshot" aria-label="Current public financial projection"><article><span>Raised</span><strong>{inr(summary.totalRaisedPaise)}</strong><p>Successful donation entries</p></article><article><span>Spent</span><strong>{inr(summary.totalSpentPaise)}</strong><p>Recorded expense entries</p></article><article><span>Available</span><strong>{inr(summary.balancePaise)}</strong><p>Derived, not editable</p></article></section><section className="admin-note"><span className="stamp">OPERATOR CHECK</span><div><strong>Before you submit a financial entry</strong><p>Confirm the source record, Member linkage where required, public-display preference, and amount in paise. Duplicate and audit checks are enforced by the server.</p></div><Link href="/admin/audit-log">Open audit evidence →</Link></section><section className="admin-workstream-grid">{workstreams.map(([group, title, copy, href]) => <Link href={href} key={title} className="admin-workstream"><span>{group}</span><h2>{title}</h2><p>{copy}</p><strong>Open workflow →</strong></Link>)}</section><section className="admin-gated-row"><div><p className="eyebrow">Not yet operational</p><h2>Moderation and voter review remain closed.</h2><p>These workflows need named owners, safeguarding evidence, privacy decisions, and explicit approval before they can accept user content or restricted documents.</p></div><div><Link href="/admin/moderation">Moderation gate</Link><Link href="/admin/members/verify">Voter review gate</Link><Link href="/admin/receipts">Receipt readiness</Link></div></section></main>;
}
