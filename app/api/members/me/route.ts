import { NextResponse } from "next/server";
import { z } from "zod";
import { getMemberByUserId, saveMemberProfile } from "@/server/db";
import { getManagedUser } from "@/lib/auth/session";

export const runtime = "nodejs";
const profileSchema = z.object({ fullName: z.string().trim().min(2).max(160), phone: z.string().trim().min(7).max(30), email: z.string().email().optional().or(z.literal("")), dateOfBirth: z.string().date(), villageWard: z.string().trim().min(2).max(160), publicDisplayName: z.string().trim().max(120).optional().or(z.literal("")), isAnonymous: z.boolean() });
export async function GET() { const user = await getManagedUser(); if (!user) return NextResponse.json({ error: { code: "unauthenticated", message: "Member session required." } }, { status: 401 }); return NextResponse.json({ member: await getMemberByUserId(user.id) }); }
export async function PATCH(request: Request) { const user = await getManagedUser(); if (!user) return NextResponse.json({ error: { code: "unauthenticated", message: "Member session required." } }, { status: 401 }); const parsed = profileSchema.safeParse(await request.json()); if (!parsed.success) return NextResponse.json({ error: { code: "invalid_profile", message: "Profile details are invalid.", field_errors: parsed.error.flatten().fieldErrors } }, { status: 400 }); const input = parsed.data; const member = await saveMemberProfile({ userId: user.id, ...input, email: input.email || user.email, publicDisplayName: input.publicDisplayName || null }); return NextResponse.json({ member }); }
