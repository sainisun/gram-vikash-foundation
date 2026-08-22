import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
export const metadata: Metadata = { title: "Gram Vikash Foundation", description: "A village-led public ledger for visible, accountable giving." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body><div className="shell"><header className="nav"><Link href="/" className="brand">Gram Vikash <small>PUBLIC LEDGER</small></Link><nav className="navlinks"><Link href="/programs">Programs</Link><Link href="/dashboard">Transparency</Link><Link href="/about">Trust</Link><Link href="/my-donations">Member access</Link></nav><Link className="button gold" href="/donate">Donate</Link></header>{children}</div></body></html>; }
