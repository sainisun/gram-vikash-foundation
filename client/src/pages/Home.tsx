import { ArrowRight, BadgeCheck, BookOpen, HandHeart, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import { FinancialSummary } from "@/components/foundation/FinancialSummary";
import { DonationLedger, ExpenseLedger } from "@/components/foundation/LedgerTable";
import { TopNav } from "@/components/foundation/TopNav";
import { trpc } from "@/lib/trpc";

const values = [
  { icon: BookOpen, title: "Learning stays local", text: "Free coaching and a community library give young learners a steady place to study." },
  { icon: HandHeart, title: "Support stays human", text: "Kanyadan support is handled with care, dignity, and privacy-first public reporting." },
  { icon: ShieldCheck, title: "Records stay visible", text: "Every approved donation and expense is reflected in the public financial view." },
];

export default function Home() {
  const donations = trpc.publicTransparency.donationLedger.useQuery({ limit: 5 });
  const expenses = trpc.publicTransparency.expenseLedger.useQuery({ limit: 5 });
  return <div className="min-h-screen bg-[#fffdf6] text-[#172033]"><TopNav />
    <main>
      <section className="paper-grid overflow-hidden border-b border-[#e5dcc7]"><div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_.9fr] lg:py-24">
        <div className="relative z-10"><p className="section-kicker">Village-led · Transparent by design</p><h1 className="display-title mt-3 max-w-3xl text-5xl leading-[0.96] text-[#28306b] sm:text-6xl">Every rupee gets a visible place in the story.</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-[#514e48]">Gram Vikash Foundation supports free coaching, a community library, and dignified family assistance—while sharing an auditable view of money received and money spent.</p><div className="mt-8 flex flex-wrap gap-3"><Link href="/member" className="soft-focus inline-flex items-center gap-2 rounded-md bg-[#28306b] px-5 py-3 font-bold text-white no-underline transition-transform active:scale-[0.97]">Register to donate <ArrowRight className="h-4 w-4" /></Link><Link href="/transparency" className="soft-focus inline-flex items-center gap-2 rounded-md border border-[#bfb39a] bg-[#fffdf6] px-5 py-3 font-bold text-[#28306b] no-underline">Explore the ledger</Link></div><p className="mt-4 text-sm text-[#746f66]">Registration links a donation to a Member record. Choosing Anonymous only hides a public name.</p></div>
        <aside className="ledger-panel rounded-2xl p-6 sm:p-8"><div className="ledger-content"><div className="flex items-center gap-2"><BadgeCheck className="h-5 w-5 text-[#18765d]" /><span className="font-mono text-xs font-semibold uppercase tracking-[0.12em] text-[#18765d]">Transparency promise</span></div><p className="display-title mt-5 text-3xl text-[#172033]">No invented totals. No invisible edits.</p><dl className="mt-7 grid gap-4"><div className="border-t border-[#e8dfcd] pt-4"><dt className="text-sm font-bold">Derived financial summary</dt><dd className="mt-1 text-sm leading-6 text-[#635f58]">The public balance is calculated from successful donation and expense records.</dd></div><div className="border-t border-[#e8dfcd] pt-4"><dt className="text-sm font-bold">Auditable admin actions</dt><dd className="mt-1 text-sm leading-6 text-[#635f58]">Offline records are written through protected operations and paired with audit events.</dd></div><div className="border-t border-[#e8dfcd] pt-4"><dt className="text-sm font-bold">Carefully staged capability</dt><dd className="mt-1 text-sm leading-6 text-[#635f58]">Payments, community, identity review, and voting remain disabled until their approvals are complete.</dd></div></dl></div></aside>
      </div></section>
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6"><FinancialSummary /></section>
      <section className="mx-auto grid max-w-6xl gap-5 px-4 pb-16 sm:px-6 lg:grid-cols-2"><DonationLedger rows={donations.data ?? []} compact /><ExpenseLedger rows={expenses.data ?? []} compact /></section>
      <section className="border-y border-[#e5dcc7] bg-[#f7f0df]"><div className="mx-auto max-w-6xl px-4 py-16 sm:px-6"><p className="section-kicker">What the foundation carries forward</p><div className="mt-4 grid gap-5 md:grid-cols-3">{values.map(item => <article key={item.title} className="rounded-xl border border-[#e1d6be] bg-[#fffdf6] p-6"><item.icon className="h-6 w-6 text-[#c94a45]" /><h2 className="display-title mt-5 text-2xl">{item.title}</h2><p className="mt-2 leading-7 text-[#635f58]">{item.text}</p></article>)}</div></div></section>
    </main>
    <footer className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-[#746f66] sm:flex-row sm:items-center sm:justify-between sm:px-6"><span>Gram Vikash Foundation · Transparency is a daily practice.</span><div className="flex gap-4"><Link href="/transparency" className="soft-focus text-[#28306b]">Ledger</Link><Link href="/member" className="soft-focus text-[#28306b]">Member access</Link><Link href="/admin" className="soft-focus text-[#28306b]">Admin</Link></div></footer>
  </div>;
}
