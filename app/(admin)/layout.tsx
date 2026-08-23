import { requireManagedAdmin } from "@/lib/auth/session";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireManagedAdmin();
  return children;
}
