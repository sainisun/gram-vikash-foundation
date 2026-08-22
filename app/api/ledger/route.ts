import { NextResponse } from "next/server";
import { getPublicDonationLedger, getPublicExpenseLedger } from "@/server/db";
export const runtime = "nodejs";
export async function GET() { const [donations, expenses] = await Promise.all([getPublicDonationLedger(50), getPublicExpenseLedger(50)]); return NextResponse.json({ donations, expenses }); }
