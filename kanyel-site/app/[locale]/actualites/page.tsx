import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ArticlesGrid from "@/components/ArticlesGrid";
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

  return (
    <>
      <Header settings={settings} departments={departments} />
      <ArticlesGrid articles={articles} locale={locale as Locale} />
      <Footer settings={settings} departments={departments} locale={locale as Locale} />
    </>
  );
}
