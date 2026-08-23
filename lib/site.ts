const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
export const siteUrl = new URL(configuredSiteUrl || "http://localhost:3000");
export const siteName = "Gram Vikash Foundation";
export const siteDescription = "A village-led public ledger for visible, accountable giving.";
