import type { MetadataRoute } from "next";
import { getDepartments, SITE_URL } from "@/lib/api";
import { routing } from "@/i18n/routing";

export const revalidate = 60;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const departments = await getDepartments();

  const staticPaths = ["", "/temoignages", "/offres-emploi", "/mentions-legales", "/confidentialite"];

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    for (const path of staticPaths) {
      entries.push({ url: `${SITE_URL}/${locale}${path}`, lastModified: new Date() });
    }
    for (const d of departments) {
      entries.push({ url: `${SITE_URL}/${locale}/activites/${d.slug}`, lastModified: new Date() });
    }
  }

  return entries;
}
