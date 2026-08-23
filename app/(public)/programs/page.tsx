import Link from "next/link";
import { getPublicPrograms } from "@/server/db";

const strands = [
  ["Learning support", "Free coaching and study support for children who need a steadier path to learning."],
  ["Community library", "A shared learning resource centred on books, reading, and local access."],
  ["Family assistance", "Dignified support for families facing financial strain around a daughter’s wedding."],
] as const;

export default async function ProgramsPage() {
  const programs = await getPublicPrograms();
  return <main className="main"><section className="page-intro"><p className="eyebrow">Programs</p><div className="record-id">PROGRAM REGISTER / ACTIVE VIEW</div><h1>Work that can be followed, not just promised.</h1><p>Administrator-approved program pages provide the public view of active work. The register below distinguishes the foundation’s mission areas from verified published updates.</p></section>{programs.length ? <section className="program-grid">{programs.map(program => <Link className="program-card" href={`/programs/${program.slug}`} key={program.id}><span className="stamp">PUBLISHED</span><h2>{program.name}</h2><p>{program.shortDescription}</p><span className="card-arrow">Open program record →</span></Link>)}</section> : <><section className="mission-grid">{strands.map(([title, copy], index) => <article key={title}><span>0{index + 1}</span><h2>{title}</h2><p>{copy}</p></article>)}</section><section className="empty-ledger"><span className="stamp">AWAITING PUBLICATION</span><h2>No verified program updates are published yet.</h2><p>The mission areas above are provided for context. Authorized administrators publish program records only after content and consent checks are complete.</p><Link href="/trust">Read the transparency policy →</Link></section></>}</main>;
}
