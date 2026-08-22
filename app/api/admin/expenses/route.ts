import { NextResponse } from "next/server";
import { z } from "zod";
import { recordExpense } from "@/server/db";
import { getManagedUser } from "@/lib/auth/session";
export const runtime = "nodejs";
const schema = z.object({ programId: z.number().int().positive().nullable(), amountPaise: z.number().int().positive().max(1000000000), category: z.enum(["coaching", "library", "kanyadan", "operations", "other"]), publicDescription: z.string().trim().min(5).max(500), privateNotes: z.string().trim().max(2000).optional().or(z.literal("")), spentAt: z.string().datetime() });
export async function POST(request: Request) { const user = await getManagedUser(); if (!user || user.role !== "admin") return NextResponse.json({ code: "forbidden" }, { status: 403 }); const parsed = schema.safeParse(await request.json()); if (!parsed.success) return NextResponse.json({ code: "invalid_expense", issues: parsed.error.flatten() }, { status: 400 }); const input = parsed.data; const id = await recordExpense({ actorUserId: user.id, programId: input.programId, amountPaise: input.amountPaise, category: input.category, publicDescription: input.publicDescription, privateNotes: input.privateNotes || null, spentAt: new Date(input.spentAt) }); return NextResponse.json({ id }); }
