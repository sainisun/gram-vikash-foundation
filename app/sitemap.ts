import type { MetadataRoute } from "next";
import { getPublicPrograms } from "@/server/db";
import { siteUrl } from "@/lib/site";

const publicPaths = ["/", "/programs", "/dashboard", "/ledger", "/ledger/donations", "/ledger/expenses", "/donor-wall", "/about", "/register", "/login"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries = publicPaths.map(path => ({ url: new URL(path, siteUrl).toString(), lastModified: new Date(), changeFrequency: path === "/" ? "weekly" as const : "monthly" as const, priority: path === "/" ? 1 : 0.7 }));
  const programs = await getPublicPrograms();
  return [...staticEntries, ...programs.map(program => ({ url: new URL(`/programs/${program.slug}`, siteUrl).toString(), lastModified: program.updatedAt, changeFrequency: "monthly" as const, priority: 0.8 }))];
}
