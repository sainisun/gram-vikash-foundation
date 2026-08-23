import { redirect } from "next/navigation";
import { LedgerDetail } from "@/components/transparency/LedgerDetail";
import { getPublicExpenseLedger } from "@/server/db";

export default async function ExpenseLedgerPage() { const rows = await getPublicExpenseLedger(50); return <LedgerDetail mode="expenses" initialItems={rows.map(row => ({ id: row.id, primary: row.publicDescription, secondary: `${row.category} · ${new Date(row.spentAt).toLocaleDateString()}`, amountPaise: row.amountPaise }))} />; }
