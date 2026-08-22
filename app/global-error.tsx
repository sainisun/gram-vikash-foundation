"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main style={{ minHeight: "100vh", margin: 0, padding: "48px", fontFamily: "Arial, sans-serif", background: "#fffdf6", color: "#16204b" }}><p style={{ color: "#94722b", fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase" }}>Gram Vikash Foundation</p><h1>We could not load this page.</h1><p>Please try again. If the problem continues, contact the foundation administrator.</p><button onClick={reset} style={{ border: 0, borderRadius: 8, padding: "12px 16px", background: "#16204b", color: "#fff" }}>Try again</button></main>;
}
