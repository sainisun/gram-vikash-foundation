import { requireManagedAdmin } from "@/lib/auth/session";
import ExportPanel from "./export-panel";
export default async function AdminExportsPage() { await requireManagedAdmin(); return <main className="main"><p className="eyebrow">Admin · exports</p><h1>Prepare audit-backed financial exports.</h1><ExportPanel /></main>; }
