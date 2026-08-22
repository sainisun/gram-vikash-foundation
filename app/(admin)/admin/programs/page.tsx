import { getProgramsForAdmin } from "@/server/db";
import { requireManagedAdmin } from "@/lib/auth/session";
import ProgramManager from "./program-manager";
export default async function AdminProgramsPage() { await requireManagedAdmin(); const programs = await getProgramsForAdmin(); return <main className="main"><p className="eyebrow">Admin · programs</p><h1>Program publishing.</h1><ProgramManager programs={programs.map(program => ({ id: program.id, name: program.name, slug: program.slug, shortDescription: program.shortDescription, isActive: program.isActive }))} /></main>; }
