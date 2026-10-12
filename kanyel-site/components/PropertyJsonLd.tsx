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

  // Escape "<" so a value containing "</script>" can't break out of the
  // script tag and inject arbitrary HTML/JS (JSON.stringify alone does not
  // escape it).
  const json = JSON.stringify(jsonLd).replace(/</g, "\\u003c");

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
