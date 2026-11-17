import type { Metadata } from "next";
import { SITE_URL, type Locale } from "./api";

/** Construit un bloc title/description/OG/hreflang cohérent pour une page publique. */
export function pageMetadata({
  locale,
  path,
  title,
  description,
  image,
}: {
  locale: Locale;
  /** Chemin sans le préfixe de locale, ex. "/realisations" ou "/actualites/mon-article". */
  path: string;
  title: string;
  description: string;
  image?: string | null;
}): Metadata {
  const url = `${SITE_URL}/${locale}${path}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        fr: `${SITE_URL}/fr${path}`,
        en: `${SITE_URL}/en${path}`,
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "KANYEL SARL",
      locale: locale === "en" ? "en_US" : "fr_FR",
      type: "website",
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
