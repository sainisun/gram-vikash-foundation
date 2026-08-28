import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getMemberByUserId, getUserByOpenId, upsertUser } from "@/server/db";

export async function getManagedUser() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;
    await upsertUser({
      openId: data.user.id,
      name: data.user.user_metadata?.full_name ?? data.user.email ?? null,
      email: data.user.email ?? null,
      loginMethod: "supabase_magic_link",
      lastSignedIn: new Date(),
    });
    return await getUserByOpenId(data.user.id) ?? null;
  } catch {
    return null;
  }
}

export async function requireManagedUser() {
  const user = await getManagedUser();
  if (!user) redirect("/access-required");
  return user;
}

export async function requireManagedAdmin() {
  const user = await requireManagedUser();
  if (user.role !== "admin") redirect("/access-required");
  return user;
}

/** Requires an authenticated, active, registered Member. Use for feature actions, not profile onboarding. */
export async function requireMember() {
  const user = await requireManagedUser();
  const member = await getMemberByUserId(user.id);
  if (!member || member.accountStatus !== "active") redirect("/access-required");
  return { user, member };
}

/** Requires an active Member whose server-side verification tier is voter_verified. */
export async function requireVerifiedVoter() {
  const context = await requireMember();
  if (context.member.verificationTier !== "voter_verified") redirect("/access-required");
  return context;
}

/** Contract-compatible name for the role-checked administrative guard. */
export const requireAdmin = requireManagedAdmin;

