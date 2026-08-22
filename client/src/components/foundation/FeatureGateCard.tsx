import { LockKeyhole } from "lucide-react";

export function FeatureGateCard({ title, description, status = "Coming after approvals" }: { title: string; description: string; status?: string }) {
  return <article className="rounded-xl border border-[#e5dcc7] bg-[#fffdf6] p-5 shadow-[0_8px_18px_rgba(34,35,77,0.05)]"><div className="flex items-start gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#ede7d8] text-[#28306b]"><LockKeyhole className="h-4 w-4" /></span><div><p className="section-kicker">{status}</p><h3 className="display-title mt-1 text-xl">{title}</h3><p className="mt-2 text-sm leading-6 text-[#635f58]">{description}</p></div></div></article>;
}
