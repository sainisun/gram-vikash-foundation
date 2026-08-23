import Link from "next/link";

type ApprovalGateProps = { eyebrow: string; title: string; summary: string; requirements: readonly string[]; primaryHref?: string; primaryLabel?: string };

export function ApprovalGate({ eyebrow, title, summary, requirements, primaryHref = "/trust", primaryLabel = "Read the approval boundary" }: ApprovalGateProps) {
  return <main className="dashboard-page gate-page"><section className="gate-hero"><span className="stamp">NOT ACTIVE</span><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{summary}</p><Link className="button gold" href={primaryHref}>{primaryLabel}</Link></section><section className="gate-checklist"><div><p className="eyebrow">Before this can open</p><h2>Required operating evidence</h2><p>These are approval dependencies, not optional product settings. The platform deliberately fails closed until they are recorded.</p></div><ol>{requirements.map((requirement, index) => <li key={requirement}><span>{String(index + 1).padStart(2, "0")}</span>{requirement}</li>)}</ol></section><section className="gate-note"><strong>What you can do now</strong><p>Continue using the public ledger, Member profile, and approved administrative workflows. This screen contains no post, document, payment, or vote submission control.</p></section></main>;
}
