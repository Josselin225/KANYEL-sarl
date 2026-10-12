import type { Metadata } from "next";
import { SITE_URL, type Locale } from "./api";

/** Builds a consistent title/description/OG/hreflang block for a public page. */
export function pageMetadata({
  locale,
  path,
  title,
  description,
  image,
}: {
  locale: Locale;
  /** Path without the locale prefix, e.g. "/realisations" or "/actualites/mon-article". */
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
