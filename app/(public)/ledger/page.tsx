import { LedgerBoard } from "@/components/transparency/LedgerBoard";
import { getPublicDonationLedger, getPublicExpenseLedger } from "@/server/db";

export default async function LedgerPage() {
  const [donations, expenses] = await Promise.all([getPublicDonationLedger(30), getPublicExpenseLedger(30)]);
  return <main className="main"><LedgerBoard initialDonations={donations.map(row => ({ ...row, donatedAt: new Date(row.donatedAt).toISOString() }))} initialExpenses={expenses.map(row => ({ ...row, spentAt: new Date(row.spentAt).toISOString() }))} /><section className="ledger-guidance"><span className="stamp">PUBLIC-SAFE VIEW</span><p>Use the public ledger to follow published financial records. Sensitive receipts, Member contact data, administrator notes, and restricted documents are not exposed here.</p></section></main>;
}
