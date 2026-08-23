import Link from "next/link";

export default function RegisterPage() {
  return <main className="main"><p className="eyebrow">Member registration</p><h1>One Member account for every protected feature.</h1><section className="ledger"><p>Registration precedes donation, personal records, community access, and any future voting eligibility. Continue to Member access to use the configured secure sign-in flow.</p><Link className="button" href="/my-donations">Continue to Member access</Link></section></main>;
}
