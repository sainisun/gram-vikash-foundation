import { NextResponse } from "next/server";
import { getFeatureGates } from "@/server/db";
import { getManagedUser } from "@/lib/auth/session";
export const runtime = "nodejs";
export async function GET() { const user = await getManagedUser(); if (!user || user.role !== "admin") return NextResponse.json({ code: "forbidden" }, { status: 403 }); const gates = await getFeatureGates(); return NextResponse.json({ enabled: false, reason: gates.payments_live ? "Receipt event mapping is not activated." : "Receipt generation is disabled until the live payment gate is approved." }); }
