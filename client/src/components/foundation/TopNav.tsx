import { HeartHandshake, Landmark, Menu, ShieldCheck, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/", label: "Home" },
  { href: "/programs", label: "Programs" },
  { href: "/transparency", label: "Transparency" },
  { href: "/member", label: "Member access" },
];

export function TopNav() {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();
  const { user, isAuthenticated, loading, logout } = useAuth();

  return <header className="sticky top-0 z-40 border-b border-[#e5dcc7] bg-[#fffdf6]/95 backdrop-blur">
    <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
      <Link href="/" className="soft-focus flex items-center gap-2 rounded-md text-[#172033] no-underline">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#28306b] text-[#f5d88d]"><Landmark className="h-5 w-5" /></span>
        <span className="leading-none"><strong className="block font-display text-lg">Gram Vikash</strong><span className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-[#746f66]">Public ledger</span></span>
      </Link>
      <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
        {links.map(link => <Link key={link.href} href={link.href} className={`soft-focus rounded-md px-3 py-2 text-sm font-semibold no-underline transition-colors ${location === link.href ? "bg-[#ede7d8] text-[#28306b]" : "text-[#514e48] hover:bg-[#f7f0df]"}`}>{link.label}</Link>)}
      </nav>
      <div className="hidden items-center gap-2 md:flex">
        {!loading && isAuthenticated ? <>
          <span className="max-w-28 truncate text-sm font-semibold text-[#514e48]">{user?.name || "Member"}</span>
          <Button variant="outline" size="sm" className="soft-focus border-[#d7cbb2] bg-transparent" onClick={logout}>Sign out</Button>
        </> : <Button size="sm" className="soft-focus bg-[#28306b] text-white hover:bg-[#414a94]" onClick={() => startLogin()}>Sign in</Button>}
        <Link href="/member" className="soft-focus inline-flex items-center gap-2 rounded-md bg-[#edae31] px-3 py-2 text-sm font-bold text-[#172033] no-underline transition-transform active:scale-[0.97]"><HeartHandshake className="h-4 w-4" /> Donate</Link>
      </div>
      <button className="soft-focus grid h-10 w-10 place-items-center rounded-md border border-[#d7cbb2] text-[#28306b] md:hidden" aria-label={open ? "Close navigation" : "Open navigation"} onClick={() => setOpen(value => !value)}>{open ? <X /> : <Menu />}</button>
    </div>
    {open ? <div className="border-t border-[#e5dcc7] bg-[#fffdf6] px-4 py-3 md:hidden">
      <nav className="grid gap-1" aria-label="Mobile navigation">
        {links.map(link => <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className={`soft-focus rounded-md px-3 py-2.5 font-semibold no-underline ${location === link.href ? "bg-[#ede7d8] text-[#28306b]" : "text-[#514e48]"}`}>{link.label}</Link>)}
        <Link href="/admin" onClick={() => setOpen(false)} className="soft-focus mt-1 inline-flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-semibold text-[#514e48] no-underline"><ShieldCheck className="h-4 w-4" /> Admin operations</Link>
        {!loading && !isAuthenticated ? <Button className="mt-2 bg-[#28306b] text-white" onClick={() => startLogin()}>Sign in to continue</Button> : null}
      </nav>
    </div> : null}
  </header>;
}
