import Link from "next/link";

export default function LoginPage() {
  return <main className="main"><p className="eyebrow">Member sign-in</p><h1>Access your single Member account.</h1><section className="ledger"><p>The platform uses the configured secure identity service. Continue to Member access to begin or resume the authenticated session.</p><Link className="button" href="/my-donations">Member access</Link></section></main>;
}
