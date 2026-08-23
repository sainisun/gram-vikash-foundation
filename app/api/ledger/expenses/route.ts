import { NextResponse } from "next/server";
import { getPublicExpenseLedger } from "@/server/db";
export const runtime = "nodejs";
export async function GET() { return NextResponse.json({ items: await getPublicExpenseLedger(50), generated_at: new Date().toISOString() }); }
