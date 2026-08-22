import { ArrowRight, FileText, ReceiptIndianRupee } from "lucide-react";
import { Link } from "wouter";
import { inr } from "./FinancialSummary";

type DonationRow = { id: number; amountPaise: number; donatedAt: Date | null; programName: string; displayName: string };
type ExpenseRow = { id: number; amountPaise: number; category: string; publicDescription: string; spentAt: Date; programName: string };

function date(value: Date | null) { return value ? new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value)) : "—"; }

export function DonationLedger({ rows, compact = false }: { rows: DonationRow[]; compact?: boolean }) {
  const visible = compact ? rows.slice(0, 5) : rows;
  return <section className="ledger-panel overflow-hidden rounded-xl" aria-labelledby="donation-ledger-title"><div className="ledger-content py-5 pr-5">
    <div className="mb-4 flex items-start justify-between gap-4"><div><p className="section-kicker">Incoming ledger</p><h2 id="donation-ledger-title" className="display-title text-2xl">Donations received</h2></div>{compact ? <Link href="/transparency" className="soft-focus inline-flex items-center gap-1 text-sm font-bold text-[#28306b]">View all <ArrowRight className="h-4 w-4" /></Link> : null}</div>
    {visible.length ? <div className="divide-y divide-[#e8dfcd]">{visible.map(row => <div key={row.id} className="grid grid-cols-[1fr_auto] gap-3 py-3"><div className="min-w-0"><p className="truncate font-semibold text-[#172033]">{row.displayName}</p><p className="mt-0.5 text-xs text-[#746f66]">{row.programName} · {date(row.donatedAt)}</p></div><strong className="mono-number self-center text-sm text-[#18765d]">+ {inr(row.amountPaise)}</strong></div>)}</div> : <EmptyLedger label="No successful donation records are available yet." icon={ReceiptIndianRupee} />}
  </div></section>;
}

export function ExpenseLedger({ rows, compact = false }: { rows: ExpenseRow[]; compact?: boolean }) {
  const visible = compact ? rows.slice(0, 5) : rows;
  return <section className="ledger-panel overflow-hidden rounded-xl" aria-labelledby="expense-ledger-title"><div className="ledger-content py-5 pr-5">
    <div className="mb-4 flex items-start justify-between gap-4"><div><p className="section-kicker">Outgoing ledger</p><h2 id="expense-ledger-title" className="display-title text-2xl">Expenses recorded</h2></div>{compact ? <Link href="/transparency" className="soft-focus inline-flex items-center gap-1 text-sm font-bold text-[#28306b]">View all <ArrowRight className="h-4 w-4" /></Link> : null}</div>
    {visible.length ? <div className="divide-y divide-[#e8dfcd]">{visible.map(row => <div key={row.id} className="grid grid-cols-[1fr_auto] gap-3 py-3"><div className="min-w-0"><p className="truncate font-semibold text-[#172033]">{row.publicDescription}</p><p className="mt-0.5 text-xs text-[#746f66]">{row.category} · {row.programName} · {date(row.spentAt)}</p></div><strong className="mono-number self-center text-sm text-[#c94a45]">− {inr(row.amountPaise)}</strong></div>)}</div> : <EmptyLedger label="No expense records are available yet." icon={FileText} />}
  </div></section>;
}

function EmptyLedger({ label, icon: Icon }: { label: string; icon: typeof FileText }) { return <div className="rounded-lg border border-dashed border-[#d7cbb2] bg-[#fffaf0] px-4 py-7 text-center"><Icon className="mx-auto h-5 w-5 text-[#a79e90]" /><p className="mt-2 text-sm text-[#746f66]">{label}</p></div>; }
