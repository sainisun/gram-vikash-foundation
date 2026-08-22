import { NextResponse } from "next/server";
import { getManagedUser } from "@/lib/auth/session";
export const runtime = "nodejs";
export async function GET() { const user = await getManagedUser(); if (!user) return NextResponse.json({ code: "unauthenticated" }, { status: 401 }); return NextResponse.json({ id: user.id, name: user.name, email: user.email, role: user.role }); }
