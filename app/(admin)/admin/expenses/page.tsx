import { requireManagedAdmin } from "@/lib/auth/session";
import ExpenseForm from "./expense-form";
export default async function AdminExpensesPage() { await requireManagedAdmin(); return <main className="main"><p className="eyebrow">Admin · expenses</p><h1>Expense entry.</h1><ExpenseForm /></main>; }
