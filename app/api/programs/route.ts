import { NextResponse } from "next/server";
import { getPublicPrograms } from "@/server/db";
export const runtime = "nodejs";
export async function GET() { return NextResponse.json(await getPublicPrograms()); }
