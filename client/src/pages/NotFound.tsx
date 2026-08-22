import { Link } from "wouter";
import { TopNav } from "@/components/foundation/TopNav";

export default function NotFound() { return <div className="min-h-screen bg-[#fffdf6]"><TopNav /><main className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6"><p className="section-kicker">404</p><h1 className="display-title mt-2 text-5xl text-[#28306b]">This page is not in the ledger.</h1><p className="mt-4 text-[#635f58]">Return to the public foundation page to continue.</p><Link href="/" className="soft-focus mt-7 inline-flex rounded-md bg-[#28306b] px-5 py-3 font-bold text-white no-underline">Go home</Link></main></div>; }
