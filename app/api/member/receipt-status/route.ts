import { NextResponse } from "next/server";
import { getFeatureGates } from "@/server/db";
import { getManagedUser } from "@/lib/auth/session";
export const runtime = "nodejs";
export async function GET() { const user = await getManagedUser(); if (!user) return NextResponse.json({ code: "unauthenticated" }, { status: 401 }); const gates = await getFeatureGates(); return NextResponse.json({ enabled: false, reason: gates.payments_live ? "Receipt event mapping is not activated." : "Receipts are unavailable until the live-payment gate, Razorpay verification, reconciliation ownership, and finance approval are complete." }); }
