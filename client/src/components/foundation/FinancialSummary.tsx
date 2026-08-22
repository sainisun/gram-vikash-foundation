import { ArrowDownRight, ArrowUpRight, Landmark, WalletCards } from "lucide-react";
import { trpc } from "@/lib/trpc";

function inr(amountPaise: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amountPaise / 100);
}

export function FinancialSummary() {
  const summary = trpc.publicTransparency.summary.useQuery(undefined, { refetchInterval: 45_000 });
  const data = summary.data ?? { totalRaisedPaise: 0, totalSpentPaise: 0, balancePaise: 0, donorCount: 0, updatedAt: new Date() };
  const cards = [
    { label: "Raised", value: inr(data.totalRaisedPaise), detail: "Successful donations", icon: ArrowUpRight, color: "text-[#18765d]" },
    { label: "Spent", value: inr(data.totalSpentPaise), detail: "Recorded expenses", icon: ArrowDownRight, color: "text-[#c94a45]" },
    { label: "Available", value: inr(data.balancePaise), detail: "Raised minus spent", icon: WalletCards, color: "text-[#28306b]" },
    { label: "Supporters", value: String(data.donorCount), detail: "Distinct successful donors", icon: Landmark, color: "text-[#8e6617]" },
  ];
  return <section aria-labelledby="summary-title">
    <div className="mb-4 flex items-end justify-between gap-4"><div><p className="section-kicker">Live-style ledger view</p><h2 id="summary-title" className="display-title mt-1 text-3xl text-[#172033]">Money, shown in motion.</h2></div><p className="hidden font-mono text-xs text-[#746f66] sm:block">Refreshes every 45 seconds</p></div>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(card => <article key={card.label} className="rounded-xl border border-[#e5dcc7] bg-[#fffdf6] p-4 shadow-[0_8px_18px_rgba(34,35,77,0.06)]">
        <div className="flex items-center justify-between"><span className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.13em] text-[#746f66]">{card.label}</span><card.icon className={`h-4 w-4 ${card.color}`} /></div>
        <strong className={`mono-number mt-3 block text-2xl ${card.color}`}>{summary.isLoading ? "—" : card.value}</strong>
        <span className="mt-1 block text-xs text-[#746f66]">{card.detail}</span>
      </article>)}
    </div>
  </section>;
}

export { inr };
