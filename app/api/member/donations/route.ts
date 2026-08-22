import { NextResponse } from "next/server";
import { getMemberDonationHistory } from "@/server/db";
import { getManagedUser } from "@/lib/auth/session";
export const runtime = "nodejs";
export async function GET() { const user = await getManagedUser(); if (!user) return NextResponse.json({ code: "unauthenticated" }, { status: 401 }); return NextResponse.json({ donations: await getMemberDonationHistory(user.id) }); }
