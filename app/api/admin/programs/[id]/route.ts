import { NextResponse } from "next/server";
import { retireProgram } from "@/server/db";
import { getManagedUser } from "@/lib/auth/session";
export const runtime = "nodejs";
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) { const user = await getManagedUser(); if (!user || user.role !== "admin") return NextResponse.json({ code: "forbidden" }, { status: 403 }); const { id } = await params; const programId = Number(id); if (!Number.isInteger(programId) || programId < 1) return NextResponse.json({ code: "invalid_program" }, { status: 400 }); await retireProgram({ actorUserId: user.id, id: programId }); return NextResponse.json({ retired: true }); }
