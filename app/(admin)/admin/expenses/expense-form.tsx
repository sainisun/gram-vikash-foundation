"use client";

import { FormEvent, useState } from "react";

export default function ExpenseForm() {
  const [status, setStatus] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    const form = event.currentTarget;
    const fd = new FormData(form);
    const amount = Number(fd.get("amount"));
    if (!Number.isFinite(amount) || amount <= 0) { setStatus({ tone: "error", message: "Enter an amount greater than ₹0." }); return; }
    setSubmitting(true); setStatus(null);
    try {
      const response = await fetch("/api/admin/expenses", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ programId: null, amountPaise: Math.round(amount * 100), category: fd.get("category"), publicDescription: fd.get("publicDescription"), privateNotes: fd.get("privateNotes"), spentAt: new Date(String(fd.get("spentAt"))).toISOString() }) });
      if (!response.ok) throw new Error("The server did not accept this entry.");
      form.reset(); setStatus({ tone: "success", message: "Expense recorded with audit evidence. Public totals derive from the approved source entry." });
    } catch { setStatus({ tone: "error", message: "Expense could not be recorded. Review the required fields and try once more." }); } finally { setSubmitting(false); }
  }
  return <form className="ledger operation-form" onSubmit={submit}><div className="form-heading"><div><p className="eyebrow">Financial entry</p><h2>Record an expense</h2></div><span className="stamp">AUDITED</span></div><p>Use a public-safe description. Private notes stay outside the public ledger.</p><label>Amount (₹)<input name="amount" type="number" min="1" step="0.01" required disabled={submitting} /></label><label>Category<select name="category" defaultValue="operations" disabled={submitting}><option value="coaching">Coaching</option><option value="library">Library</option><option value="kanyadan">Kanyadan</option><option value="operations">Operations</option><option value="other">Other</option></select></label><label>Public description<input name="publicDescription" required disabled={submitting} /></label><label>Private internal notes<textarea name="privateNotes" disabled={submitting} /></label><label>Date spent<input name="spentAt" type="datetime-local" required disabled={submitting} /></label><button className="button" type="submit" disabled={submitting}>{submitting ? "Recording expense…" : "Record expense"}</button>{status ? <p className={`form-status ${status.tone}`} role="status">{status.message}</p> : null}</form>;
}
