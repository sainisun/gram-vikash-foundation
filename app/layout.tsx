import type { Metadata } from "next";
import Link from "next/link";
import { GramMark } from "@/components/brand/GramMark";
import "./globals.css";

export const metadata: Metadata = { title: "Gram Vikash Foundation", description: "A village-led public ledger for visible, accountable giving." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><div className="shell"><header className="nav"><GramMark /><nav className="navlinks" aria-label="Public navigation"><Link href="/programs">Programs</Link><Link href="/dashboard">Transparency</Link><Link href="/ledger">Ledger</Link><Link href="/about">Trust</Link><Link href="/my-donations">Member access</Link></nav><Link className="button gold nav-donate" href="/donate">Donate</Link></header>{children}<footer className="public-footer"><div><strong>Gram Vikash Foundation</strong><p>Village-led work with a visible financial record.</p></div><div><Link href="/trust">Trust & accountability</Link><Link href="/ledger">Public ledger</Link><Link href="/register">Member registration</Link></div><small>Financial totals are published from source records. Sensitive features remain approval-gated.</small></footer></div></body></html>;
}
