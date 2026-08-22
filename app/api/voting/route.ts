import { NextResponse } from "next/server";
export async function GET() { return NextResponse.json({ code: "voting_gate_closed", message: "Voting remains disabled pending community-pilot, verification, and governance approval." }, { status: 503 }); }

