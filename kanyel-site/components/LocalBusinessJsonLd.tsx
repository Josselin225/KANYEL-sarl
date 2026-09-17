import { pick, SITE_URL, type ApiSiteSettings, type Locale } from "@/lib/api";

export default function LocalBusinessJsonLd({
  settings,
  locale,
}: {
  settings: ApiSiteSettings | null;
  locale: Locale;
}) {
  if (!settings) return null;

  const hasGeo = settings.latitude != null && settings.longitude != null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: settings.company_name,
    slogan: pick(settings, "slogan", locale) || undefined,
    image: settings.hero_image || undefined,
    url: SITE_URL,
    telephone: settings.phone_1 || undefined,
    email: settings.email_main || undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: pick(settings, "address", locale) || settings.address_fr,
      addressCountry: "CI",
    },
    geo: hasGeo
      ? {
          "@type": "GeoCoordinates",
          latitude: settings.latitude,
          longitude: settings.longitude,
        }
      : undefined,
  };

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}