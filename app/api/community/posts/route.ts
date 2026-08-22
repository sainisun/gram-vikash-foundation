import { NextResponse } from "next/server";
export async function GET() { return NextResponse.json({ code: "community_gate_closed", message: "Community posting remains disabled until moderation and safeguarding approvals are complete." }, { status: 503 }); }
