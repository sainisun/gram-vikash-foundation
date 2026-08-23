import Link from "next/link";
import { ManagedLoginButton } from "@/components/auth/ManagedLoginButton";

export default function LoginPage() { return <main className="main"><p className="eyebrow">Member sign-in</p><h1>Access your single Member account.</h1><section className="ledger"><p>The platform uses the configured secure identity service and a one-time browser-bound OAuth state check.</p><ManagedLoginButton label="Sign in securely" /><p><Link href="/register">Need a Member account? Register</Link></p></section></main>; }
