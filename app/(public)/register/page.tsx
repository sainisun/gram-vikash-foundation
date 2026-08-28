import Link from "next/link";
import { MagicLinkForm } from "@/components/auth/MagicLinkForm";

export default function RegisterPage() {
  return (
    <main className="main">
      <p className="eyebrow">Member registration</p>
      <h1>One Member account for every protected feature.</h1>
      <section className="ledger">
        <p>Registration precedes donation, personal records, community access, and any future voting eligibility. Enter your email to receive a one-time secure link, then complete your Member profile after sign-in.</p>
        <MagicLinkForm label="Create or access Member account" />
        <p><Link href="/login">Already registered? Sign in</Link></p>
      </section>
    </main>
  );
}
