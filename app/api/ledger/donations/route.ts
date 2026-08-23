import { NextResponse } from "next/server";
import { getPublicDonationLedger } from "@/server/db";
export const runtime = "nodejs";
export async function GET() { return NextResponse.json({ items: await getPublicDonationLedger(50), generated_at: new Date().toISOString() }); }
