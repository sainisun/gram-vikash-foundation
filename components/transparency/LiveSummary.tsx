"use client";

import { useCallback, useEffect, useState } from "react";

type Summary = { totalRaisedPaise: number; totalSpentPaise: number; balancePaise: number; generatedAt: string };
const inr = (paise: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(paise / 100);

export function LiveSummary({ initial }: { initial: Summary }) {
  const [summary, setSummary] = useState(initial);
  const [status, setStatus] = useState("Showing the latest published ledger totals.");
  const [refreshing, setRefreshing] = useState(false);
  const refresh = useCallback(async () => {
    if (document.visibilityState !== "visible") return;
    setRefreshing(true);
    try {
      const response = await fetch("/api/summary", { cache: "no-store" });
      if (!response.ok) throw new Error("summary unavailable");
      const data = await response.json();
      setSummary({ totalRaisedPaise: data.total_raised_paise, totalSpentPaise: data.total_spent_paise, balancePaise: data.balance_paise, generatedAt: data.generated_at });
      setStatus("Updated from the published ledger.");
    } catch {
      setStatus("Live refresh is temporarily unavailable. Displayed totals may be stale; please try again.");
    } finally { setRefreshing(false); }
  }, []);
  useEffect(() => {
    const timer = window.setInterval(refresh, 45_000);
    const onVisible = () => { if (document.visibilityState === "visible") void refresh(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => { window.clearInterval(timer); document.removeEventListener("visibilitychange", onVisible); };
  }, [refresh]);
  return <><div className="grid"><div className="metric"><span>Raised</span><strong>{inr(summary.totalRaisedPaise)}</strong></div><div className="metric"><span>Spent</span><strong>{inr(summary.totalSpentPaise)}</strong></div><div className="metric"><span>Available</span><strong>{inr(summary.balancePaise)}</strong></div></div><div className="refresh-row"><p aria-live="polite">{status} Last generated: {new Date(summary.generatedAt).toLocaleTimeString()}.</p><button type="button" onClick={() => void refresh()} disabled={refreshing}>{refreshing ? "Refreshing…" : "Refresh totals"}</button></div></>;
}
