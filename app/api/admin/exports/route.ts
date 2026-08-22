import { NextResponse } from "next/server";
import { z } from "zod";
import { prepareFinancialExport } from "@/server/db";
import { getManagedUser } from "@/lib/auth/session";
export const runtime = "nodejs";
export async function POST(request: Request) { const user = await getManagedUser(); if (!user || user.role !== "admin") return NextResponse.json({ code: "forbidden" }, { status: 403 }); const parsed = z.object({ scope: z.enum(["donations", "expenses", "both"]) }).safeParse(await request.json()); if (!parsed.success) return NextResponse.json({ code: "invalid_export_scope" }, { status: 400 }); return NextResponse.json(await prepareFinancialExport({ actorUserId: user.id, scope: parsed.data.scope })); }
