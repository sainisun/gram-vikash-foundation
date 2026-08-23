import { redirect } from "next/navigation";
import { LedgerDetail } from "@/components/transparency/LedgerDetail";
import { getPublicDonationLedger } from "@/server/db";

export default async function DonationLedgerPage() { const rows = await getPublicDonationLedger(50); return <LedgerDetail mode="donations" initialItems={rows.map(row => ({ id: row.id, primary: row.displayName, secondary: `${row.programName} · ${new Date(row.donatedAt).toLocaleDateString()}`, amountPaise: row.amountPaise }))} />; }
