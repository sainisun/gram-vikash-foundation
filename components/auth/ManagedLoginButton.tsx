"use client";

import { useState } from "react";

export function ManagedLoginButton({ label }: { label: string }) {
  const [starting, setStarting] = useState(false);
  function start() {
    setStarting(true);
    const origin = window.location.origin;
    window.location.assign(`/api/oauth/start?origin=${encodeURIComponent(origin)}`);
  }
  return <button className="button" type="button" onClick={start} disabled={starting}>{starting ? "Opening secure sign-in…" : label}</button>;
}
