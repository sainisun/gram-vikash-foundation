"use client";

import { FormEvent, useState } from "react";

export function MagicLinkForm({ label, next = "/my-donations" }: { label: string; next?: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    try {
      const response = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, next }),
      });
      setStatus(response.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return <p role="status">If this email can receive messages, a secure sign-in link has been sent. Check your inbox to continue.</p>;
  }

  return (
    <form className="stack" onSubmit={submit}>
      <label htmlFor="magic-link-email">Email address</label>
      <input id="magic-link-email" name="email" type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} />
      <button className="button" type="submit" disabled={status === "sending"}>{status === "sending" ? "Sending secure link…" : label}</button>
      {status === "error" && <p role="alert">The secure sign-in service is temporarily unavailable. Please try again later.</p>}
    </form>
  );
}
