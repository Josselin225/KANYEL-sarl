import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Reveal, RevealGroup, RevealItem } from "./Reveal";
import { pick, type ApiArticle, type Locale } from "@/lib/api";

function formatDate(dateStr: string, locale: Locale) {
  return new Date(dateStr).toLocaleDateString(locale === "en" ? "en-US" : "fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function ArticlesGrid({
  articles,
  locale,
}: {
  articles: ApiArticle[];
  locale: Locale;
}) {
  const t = await getTranslations({ locale, namespace: "articles" });

  return (
    <>
      <section className="bg-navy-deep py-20 sm:py-24">
        <div className="mx-auto max-w-4xl px-5 text-center sm:px-8">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-gold-light">
              {t("kicker")}
            </span>
            <h1 className="mt-6 font-display text-4xl font-semibold text-white sm:text-5xl">{t("title")}</h1>
            <p className="mx-auto mt-4 max-w-xl text-base text-white/70">{t("subtitle")}</p>
          </Reveal>
        </div>
      </section>

      <section className="bg-bg-alt py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          {articles.length === 0 ? (
            <Reveal className="mx-auto max-w-md rounded-3xl bg-white p-8 text-center shadow-soft">
              <p className="text-sm text-ink-dim">{t("empty")}</p>
            </Reveal>
          ) : (
            <RevealGroup className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {articles.map((a) => (
                <RevealItem key={a.id}>
                  <Link
                    href={`/actualites/${a.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-soft transition-transform hover:-translate-y-1"
                  >
                    {a.cover_image && (
                      <div className="relative aspect-[16/9]">
                        <Image
                          src={a.cover_image}
                          alt={pick(a, "title", locale)}
                          fill
                          sizes="(max-width: 1024px) 100vw, 50vw"
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex flex-1 flex-col p-6">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gold-dark">
                        {t("publishedOn")} {formatDate(a.published_at, locale)}
                      </p>
                      <h3 className="mt-2 font-display text-lg font-semibold text-navy">{pick(a, "title", locale)}</h3>
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-dim">
                        {pick(a, "excerpt", locale) || pick(a, "content", locale).slice(0, 140)}
                      </p>
                      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-dark">
                        {t("readMore")}
                        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 transition-transform group-hover:translate-x-1">
                          <path d="M5 12h14m0 0-6-6m6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    </div>
                  </Link>
                </RevealItem>
              ))}
            </RevealGroup>
          )}
        </div>
      </section>
    </>
  );
}
