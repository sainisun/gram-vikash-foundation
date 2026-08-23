"use client";

import { FormEvent, useRef, useState } from "react";
type Member = { id: number; fullName: string; villageWard: string };

export default function OfflineDonationForm({ members }: { members: Member[] }) {
  const [status, setStatus] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const idempotencyKey = useRef(crypto.randomUUID());
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting || !members.length) return;
    const form = event.currentTarget; const fd = new FormData(form); const amount = Number(fd.get("amount"));
    if (!Number.isFinite(amount) || amount <= 0) { setStatus({ tone: "error", message: "Enter an amount greater than ₹0." }); return; }
    setSubmitting(true); setStatus(null);
    try {
      const response = await fetch("/api/admin/donations", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ memberId: Number(fd.get("memberId")), programId: null, amountPaise: Math.round(amount * 100), paymentMode: fd.get("paymentMode"), receivedAt: new Date(String(fd.get("receivedAt"))).toISOString(), notes: fd.get("notes"), idempotencyKey: idempotencyKey.current }) });
      if (!response.ok) throw new Error("The server did not accept this entry.");
      form.reset(); idempotencyKey.current = crypto.randomUUID(); setStatus({ tone: "success", message: "Offline donation recorded with the required Member link and audit evidence." });
    } catch { setStatus({ tone: "error", message: "Donation could not be recorded. Select a registered Member and review the required fields." }); } finally { setSubmitting(false); }
  }
  return <form className="ledger operation-form" onSubmit={submit}><div className="form-heading"><div><p className="eyebrow">Financial entry</p><h2>Record cash or cheque</h2></div><span className="stamp">MEMBER-LINKED</span></div><p>Public anonymity affects display only. Every offline donation remains linked to an existing registered Member.</p><label>Registered Member<select name="memberId" required defaultValue="" disabled={submitting || !members.length}><option value="" disabled>Select Member</option>{members.map(member => <option key={member.id} value={member.id}>{member.fullName} · {member.villageWard}</option>)}</select></label><label>Amount (₹)<input name="amount" type="number" min="1" step="0.01" required disabled={submitting || !members.length} /></label><label>Payment mode<select name="paymentMode" defaultValue="cash" disabled={submitting || !members.length}><option value="cash">Cash</option><option value="cheque">Cheque</option></select></label><label>Received at<input name="receivedAt" type="datetime-local" required disabled={submitting || !members.length} /></label><label>Private internal notes<textarea name="notes" disabled={submitting || !members.length} /></label><button className="button" type="submit" disabled={submitting || !members.length}>{submitting ? "Recording donation…" : "Record donation"}</button>{!members.length ? <p className="form-status error">Register a Member first; anonymous public display never removes the internal Member link.</p> : null}{status ? <p className={`form-status ${status.tone}`} role="status">{status.message}</p> : null}</form>;
}
