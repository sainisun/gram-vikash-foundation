import { requireManagedAdmin } from "@/lib/auth/session";
import { getMembersForAdmin } from "@/server/db";
import OfflineDonationForm from "./offline-donation-form";
export default async function OfflineDonationPage() { await requireManagedAdmin(); const members = await getMembersForAdmin(); return <main className="main"><p className="eyebrow">Admin · offline donations</p><h1>Cash and cheque record.</h1><OfflineDonationForm members={members.map(member => ({ id: member.id, fullName: member.fullName, villageWard: member.villageWard }))} /></main>; }
