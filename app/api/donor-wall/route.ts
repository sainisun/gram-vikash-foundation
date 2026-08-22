import { NextResponse } from "next/server";
import { getDonorWall } from "@/server/db";
export const runtime = "nodejs";
export async function GET() { return NextResponse.json({ donors: await getDonorWall(12) }); }
