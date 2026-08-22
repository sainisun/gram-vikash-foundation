import { NextResponse } from "next/server";
import { getAuditLogEntries } from "@/server/db";
import { getManagedUser } from "@/lib/auth/session";
export const runtime = "nodejs";
export async function GET() { const user = await getManagedUser(); if (!user || user.role !== "admin") return NextResponse.json({ code: "forbidden" }, { status: 403 }); return NextResponse.json({ events: await getAuditLogEntries(100) }); }
