import { notFound } from "next/navigation";
import { getPublicProgramBySlug } from "@/server/db";
export default async function ProgramDetail({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const program = await getPublicProgramBySlug(slug); if (!program) notFound(); return <main className="main"><p className="eyebrow">Program record</p><h1>{program.name}</h1><div className="ledger"><p>{program.description}</p>{program.targetMetric ? <p><strong>{program.targetMetric}:</strong> {program.currentMetricValue}</p> : null}</div></main>; }
