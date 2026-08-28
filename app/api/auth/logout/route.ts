import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  } catch (error) {
    console.error("[Supabase Auth] Sign-out failed", error);
  }
  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}
