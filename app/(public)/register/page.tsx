import Link from "next/link";
import { ManagedLoginButton } from "@/components/auth/ManagedLoginButton";

export default function RegisterPage() { return <main className="main"><p className="eyebrow">Member registration</p><h1>One Member account for every protected feature.</h1><section className="ledger"><p>Registration precedes donation, personal records, community access, and any future voting eligibility. Secure sign-in opens in the configured identity service, then returns you to your Member profile.</p><ManagedLoginButton label="Create or access Member account" /><p><Link href="/login">Already registered? Sign in</Link></p></section></main>; }
