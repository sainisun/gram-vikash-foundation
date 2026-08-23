import { NextRequest, NextResponse } from "next/server";
import { getAuditLogEntries } from "@/server/db";
import { getManagedUser } from "@/lib/auth/session";
import { parseAuditFilters } from "@/server/audit-filter";
export const runtime = "nodejs";
export async function GET(request: NextRequest) { const user = await getManagedUser(); if (!user || user.role !== "admin") return NextResponse.json({ code: "forbidden" }, { status: 403 }); const parsed = parseAuditFilters({ limit: request.nextUrl.searchParams.get("limit"), action: request.nextUrl.searchParams.get("action"), entityType: request.nextUrl.searchParams.get("entityType"), query: request.nextUrl.searchParams.get("q") }); if (!parsed.ok) return NextResponse.json({ error: { code: "invalid_filter", message: parsed.message } }, { status: 400 }); const { limit, action, entityType, query } = parsed.value; return NextResponse.json({ events: await getAuditLogEntries(limit, { action, entityType, query }), applied: { limit, action: action ?? null, entityType: entityType ?? null, query: query ?? null } }); }
