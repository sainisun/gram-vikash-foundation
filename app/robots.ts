import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: "*", allow: ["/"], disallow: ["/admin", "/my-donations", "/profile", "/feed", "/chat", "/voting", "/donate"] }], sitemap: new URL("/sitemap.xml", siteUrl).toString() };
}
