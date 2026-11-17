import { pick, SITE_URL, type ApiArticle, type Locale } from "@/lib/api";

export default function ArticleJsonLd({ article, locale }: { article: ApiArticle; locale: Locale }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: pick(article, "title", locale),
    description: pick(article, "excerpt", locale) || undefined,
    image: article.cover_image || undefined,
    datePublished: article.published_at,
    url: `${SITE_URL}/${locale}/actualites/${article.slug}`,
    publisher: {
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
