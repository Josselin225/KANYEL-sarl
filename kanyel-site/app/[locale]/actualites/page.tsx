import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ArticlesGrid from "@/components/ArticlesGrid";
import NewsletterForm from "@/components/NewsletterForm";
import { Reveal } from "@/components/Reveal";
import { getArticles, getDepartments, getSettings, type Locale } from "@/lib/api";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "articles" });
  return pageMetadata({
    locale: locale as Locale,
    path: "/actualites",
    title: `${t("title")} | KANYEL SARL`,
    description: t("subtitle"),
  });
}

export default async function ArticlesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [settings, departments, articles] = await Promise.all([
    getSettings(),
    getDepartments(),
    getArticles(),
  ]);
  const t = await getTranslations({ locale, namespace: "newsletter" });

  return (
    <>
      <Header settings={settings} departments={departments} />
      <ArticlesGrid articles={articles} locale={locale as Locale} />

      <section className="bg-bg py-16 sm:py-20">
        <div className="mx-auto max-w-2xl px-5 text-center sm:px-8">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full bg-gold-soft px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-gold-dark">
              {t("kicker")}
            </span>
            <h2 className="mt-4 font-display text-2xl font-semibold text-navy sm:text-3xl">{t("title")}</h2>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-ink-dim">{t("subtitle")}</p>
            <div className="mt-8">
              <NewsletterForm />
            </div>
          </Reveal>
        </div>
      </section>

      <Footer settings={settings} departments={departments} locale={locale as Locale} />
    </>
  );
}
