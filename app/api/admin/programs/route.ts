import { NextResponse } from "next/server";
import { z } from "zod";
import { getProgramsForAdmin, saveProgram } from "@/server/db";
import { getManagedUser } from "@/lib/auth/session";

export const runtime = "nodejs";
const programSchema = z.object({ id: z.number().int().positive().optional(), slug: z.string().trim().min(2).max(100).regex(/^[a-z0-9-]+$/), name: z.string().trim().min(2).max(160), shortDescription: z.string().trim().min(10).max(420), description: z.string().trim().min(10).max(6000), targetMetric: z.string().trim().max(120).optional().or(z.literal("")), currentMetricValue: z.number().int().min(0), isActive: z.boolean() });
async function admin() { const user = await getManagedUser(); return user?.role === "admin" ? user : null; }
export async function GET() { if (!await admin()) return NextResponse.json({ code: "forbidden" }, { status: 403 }); return NextResponse.json({ programs: await getProgramsForAdmin() }); }
export async function POST(request: Request) { const user = await admin(); if (!user) return NextResponse.json({ code: "forbidden" }, { status: 403 }); const parsed = programSchema.safeParse(await request.json()); if (!parsed.success) return NextResponse.json({ code: "invalid_program", issues: parsed.error.flatten() }, { status: 400 }); const id = await saveProgram({ actorUserId: user.id, ...parsed.data, targetMetric: parsed.data.targetMetric || null }); return NextResponse.json({ id }); }
