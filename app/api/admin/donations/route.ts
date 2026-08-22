import { NextResponse } from "next/server";
import { z } from "zod";
import { recordOfflineDonation } from "@/server/db";
import { getManagedUser } from "@/lib/auth/session";
export const runtime = "nodejs";
const schema = z.object({ memberId: z.number().int().positive(), programId: z.number().int().positive().nullable(), amountPaise: z.number().int().positive().max(1000000000), paymentMode: z.enum(["cash", "cheque"]), receivedAt: z.string().datetime(), notes: z.string().trim().max(2000).optional().or(z.literal("")), idempotencyKey: z.string().uuid() });
export async function POST(request: Request) { const user = await getManagedUser(); if (!user || user.role !== "admin") return NextResponse.json({ code: "forbidden" }, { status: 403 }); const parsed = schema.safeParse(await request.json()); if (!parsed.success) return NextResponse.json({ code: "invalid_donation", issues: parsed.error.flatten() }, { status: 400 }); const input = parsed.data; const id = await recordOfflineDonation({ actorUserId: user.id, memberId: input.memberId, programId: input.programId, amountPaise: input.amountPaise, paymentMode: input.paymentMode, receivedAt: new Date(input.receivedAt), notes: input.notes || null, idempotencyKey: input.idempotencyKey }); return NextResponse.json({ id }); }
