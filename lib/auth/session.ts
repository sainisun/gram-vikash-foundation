import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { sdk } from "@/server/_core/sdk";
import { getMemberByUserId } from "@/server/db";

export async function getManagedUser() {
  const incoming = await headers();
  try {
    return await sdk.authenticateRequest({ headers: { cookie: incoming.get("cookie") ?? "", authorization: incoming.get("authorization") ?? "" } } as never);
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
