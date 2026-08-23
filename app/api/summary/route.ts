import { NextResponse } from "next/server";
import { getPublicTransparencySnapshot } from "@/server/db";
export const runtime = "nodejs";
export async function GET() { const summary = await getPublicTransparencySnapshot(); return NextResponse.json({ total_raised_paise: summary.totalRaisedPaise, total_spent_paise: summary.totalSpentPaise, balance_paise: summary.balancePaise, donor_count: summary.donorCount, generated_at: summary.updatedAt.toISOString() }); }
