import { NextResponse } from "next/server";
export const runtime = "nodejs";
export async function POST() { return NextResponse.json({ code: "payment_gate_closed", message: "Checkout stays disabled until Razorpay onboarding, test validation, legal/finance review, and human approval are complete." }, { status: 503 }); }
