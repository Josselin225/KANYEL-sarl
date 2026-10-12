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
