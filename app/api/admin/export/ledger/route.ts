import { NextRequest, NextResponse } from "next/server";
import { prepareFinancialExport } from "@/server/db";
import { getManagedUser } from "@/lib/auth/session";
export const runtime = "nodejs";
export async function GET(request: NextRequest) { const user = await getManagedUser(); if (!user || user.role !== "admin") return NextResponse.json({ error: { code: "forbidden", message: "Administrator access required." } }, { status: 403 }); const scope = request.nextUrl.searchParams.get("scope"); if (scope !== "donations" && scope !== "expenses" && scope !== "both") return NextResponse.json({ error: { code: "invalid_scope", message: "scope must be donations, expenses, or both." } }, { status: 400 }); return NextResponse.json(await prepareFinancialExport({ actorUserId: user.id, scope })); }
