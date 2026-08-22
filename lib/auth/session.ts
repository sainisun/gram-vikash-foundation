import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { sdk } from "@/server/_core/sdk";

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
