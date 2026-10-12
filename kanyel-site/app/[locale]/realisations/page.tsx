import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RealisationsGrid from "@/components/RealisationsGrid";
import { getDepartments, getRealisationImages, getRealisations, getSettings, type Locale } from "@/lib/api";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "realisations" });
  return pageMetadata({
    locale: locale as Locale,
    path: "/realisations",
    title: `${t("title")} | KANYEL SARL`,
    description: t("subtitle"),
  });
}

export default async function RealisationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [settings, departments, realisations, realisationImages] = await Promise.all([
    getSettings(),
    getDepartments(),
    getRealisations(),
    getRealisationImages(),
  ]);

  return (
    <>
      <Header settings={settings} departments={departments} />
      <RealisationsGrid realisations={realisations} realisationImages={realisationImages} locale={locale as Locale} />
      <Footer settings={settings} departments={departments} locale={locale as Locale} />
    </>
  );
}
