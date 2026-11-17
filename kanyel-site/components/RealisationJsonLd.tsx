import { pick, SITE_URL, type ApiRealisation, type Locale } from "@/lib/api";

export default function RealisationJsonLd({ realisation, locale }: { realisation: ApiRealisation; locale: Locale }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: pick(realisation, "title", locale),
    description: pick(realisation, "description", locale),
    image: realisation.image || undefined,
    url: `${SITE_URL}/${locale}/realisations/${realisation.id}`,
    locationCreated: realisation.location || undefined,
    dateCreated: realisation.completed_at || undefined,
    creator: {
      "@type": "Organization",
      name: "KANYEL SARL",
    },
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
