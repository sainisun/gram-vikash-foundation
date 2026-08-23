import { requireManagedUser } from "@/lib/auth/session";

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  await requireManagedUser();
  return children;
}
