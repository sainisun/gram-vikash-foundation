import { NextResponse } from "next/server";
import { getPublicProgramBySlug } from "@/server/db";
export const runtime = "nodejs";
export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const program = await getPublicProgramBySlug(slug); return program ? NextResponse.json({ program }) : NextResponse.json({ code: "not_found" }, { status: 404 }); }
