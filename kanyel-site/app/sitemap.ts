import type { MetadataRoute } from "next";
import { getArticles, getDepartments, SITE_URL } from "@/lib/api";
import { routing } from "@/i18n/routing";

export const revalidate = 60;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [departments, articles] = await Promise.all([getDepartments(), getArticles()]);

  const staticPaths = [
    "",
    "/temoignages",
    "/offres-emploi",
    "/realisations",
    "/actualites",
    "/faq",
    "/devis",
    "/mentions-legales",
    "/confidentialite",
  ];

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    for (const path of staticPaths) {
      entries.push({ url: `${SITE_URL}/${locale}${path}`, lastModified: new Date() });
    }
    for (const d of departments) {
      entries.push({ url: `${SITE_URL}/${locale}/activites/${d.slug}`, lastModified: new Date() });
    }
    for (const a of articles) {
      entries.push({ url: `${SITE_URL}/${locale}/actualites/${a.slug}`, lastModified: new Date(a.published_at) });
    }
  }

  return entries;
}
