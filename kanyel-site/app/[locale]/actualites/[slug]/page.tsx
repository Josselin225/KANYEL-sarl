import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import ShareButtons from "@/components/ShareButtons";
import { getArticles, getDepartments, getSettings, pick, SITE_URL, type Locale } from "@/lib/api";

function formatDate(dateStr: string, locale: Locale) {
  return new Date(dateStr).toLocaleDateString(locale === "en" ? "en-US" : "fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const [settings, departments, articles] = await Promise.all([
    getSettings(),
    getDepartments(),
    getArticles(),
  ]);

  const article = articles.find((a) => a.slug === slug);
  if (!article) notFound();

  const t = await getTranslations({ locale, namespace: "articles" });
  const tShare = await getTranslations({ locale, namespace: "share" });
  const title = pick(article, "title", locale as Locale);

  return (
    <>
      <Header settings={settings} departments={departments} />
      <main>
        <section className="relative flex h-[45vh] min-h-[340px] w-full items-end overflow-hidden bg-navy-deep">
          {article.cover_image && (
            <Image src={article.cover_image} alt={title} fill priority sizes="100vw" className="object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/90 via-navy-deep/30 to-navy-deep/50" />
          <div className="relative mx-auto w-full max-w-3xl px-5 pb-14 sm:px-8">
            <a href={`/${locale}/actualites`} className="text-sm font-semibold text-gold-light hover:underline">
              ← {t("back")}
            </a>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-gold-light">
              {t("publishedOn")} {formatDate(article.published_at, locale as Locale)}
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold text-white sm:text-4xl">{title}</h1>
          </div>
        </section>

        <section className="bg-bg py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-5 sm:px-8">
            <Reveal>
              <p className="whitespace-pre-line text-base leading-relaxed text-ink-dim">
                {pick(article, "content", locale as Locale)}
              </p>
            </Reveal>

            <div className="mt-10 border-t border-border pt-6">
              <ShareButtons
                url={`${SITE_URL}/${locale}/actualites/${article.slug}`}
                title={title}
                label={tShare("label")}
                whatsappLabel={tShare("whatsapp")}
                facebookLabel={tShare("facebook")}
              />
            </div>
          </div>
        </section>
      </main>
      <Footer settings={settings} departments={departments} locale={locale as Locale} />
    </>
  );
}
