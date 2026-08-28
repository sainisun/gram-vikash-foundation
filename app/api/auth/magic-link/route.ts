import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  let body: { email?: unknown; next?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const next = typeof body.next === "string" && body.next.startsWith("/") && !body.next.startsWith("//") ? body.next : "/my-donations";
  if (!emailPattern.test(email)) return NextResponse.json({ error: "valid_email_required" }, { status: 400 });

  try {
    const supabase = await createSupabaseServerClient();
    const redirectTo = new URL(`/auth/confirm?next=${encodeURIComponent(next)}`, request.url).toString();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true, emailRedirectTo: redirectTo },
    });
    if (error) {
      console.error("[Supabase Auth] Magic Link request failed", error);
      return NextResponse.json({ error: "magic_link_unavailable" }, { status: 503 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Supabase Auth] Configuration failed", error);
    return NextResponse.json({ error: "auth_not_configured" }, { status: 503 });
  }
}
