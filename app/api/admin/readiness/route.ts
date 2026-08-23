import { NextResponse } from "next/server";
import { requireManagedAdmin } from "@/lib/auth/session";
import { getOperationalReadinessSnapshot } from "@/server/db";
export const runtime = "nodejs";
export async function GET() { try { await requireManagedAdmin(); return NextResponse.json(await getOperationalReadinessSnapshot()); } catch { return NextResponse.json({ code: "forbidden" }, { status: 403 }); } }
