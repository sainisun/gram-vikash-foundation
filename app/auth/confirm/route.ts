import type { EmailOtpType } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function safeNext(value: string | null) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/my-donations";
}

export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type") as EmailOtpType | null;
  const redirectTo = new URL(safeNext(request.nextUrl.searchParams.get("next")), request.url);

  if (!tokenHash || !type) {
    redirectTo.pathname = "/login";
    redirectTo.searchParams.set("error", "confirmation_required");
    return NextResponse.redirect(redirectTo);
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (error || !data.user) throw error ?? new Error("Authenticated user missing");
    return NextResponse.redirect(redirectTo);
  } catch (error) {
    console.error("[Supabase Auth] Confirmation failed", error);
    redirectTo.pathname = "/login";
    redirectTo.searchParams.set("error", "confirmation_failed");
    return NextResponse.redirect(redirectTo);
  }
}
