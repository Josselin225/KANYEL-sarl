import { pick, SITE_URL, type ApiProperty, type Locale } from "@/lib/api";

function parsePrice(price: string): number | null {
  const digits = price.replace(/[^\d]/g, "");
  return digits ? Number(digits) : null;
}

export default function PropertyJsonLd({ property, locale }: { property: ApiProperty; locale: Locale }) {
  const price = parsePrice(property.price);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: pick(property, "title", locale),
    description: pick(property, "description", locale),
    image: property.image || undefined,
    url: `${SITE_URL}/${locale}/biens/${property.id}`,
    address: property.location || undefined,
    offers: price
      ? {
          "@type": "Offer",
          price,
          priceCurrency: "XOF",
        }
      : undefined,
  };

  // Échappe "<" pour qu'une valeur contenant "</script>" ne puisse pas sortir
  // de la balise script et injecter du HTML/JS arbitraire (JSON.stringify seul
  // ne l'échappe pas).
  const json = JSON.stringify(jsonLd).replace(/</g, "\\u003c");

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
