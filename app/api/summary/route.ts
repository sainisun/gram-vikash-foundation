import { NextResponse } from "next/server";
import { getPublicTransparencySnapshot } from "@/server/db";
export const runtime = "nodejs";
export async function GET() { return NextResponse.json(await getPublicTransparencySnapshot()); }
