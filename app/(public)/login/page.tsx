import Link from "next/link";
import { MagicLinkForm } from "@/components/auth/MagicLinkForm";

export default async function LoginPage({ searchParams }: { searchParams?: Promise<{ next?: string }> }) {
  const params = searchParams ? await searchParams : {};
  const next = params.next && params.next.startsWith("/") && !params.next.startsWith("//") ? params.next : "/my-donations";
  return (
    <main className="main">
      <p className="eyebrow">Member sign-in</p>
      <h1>Access your single Member account.</h1>
      <section className="ledger">
        <p>Enter your email and we will send a one-time secure sign-in link. Your account session remains protected by server-side identity and role checks.</p>
        <MagicLinkForm label="Email me a secure sign-in link" next={next} />
        <p><Link href="/register">Need a Member account? Register</Link></p>
      </section>
    </main>
  );
}
