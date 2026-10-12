import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JobOffers from "@/components/JobOffers";
import { getDepartments, getJobOffers, getSettings, type Locale } from "@/lib/api";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "jobs" });
  return pageMetadata({
    locale: locale as Locale,
    path: "/offres-emploi",
    title: `${t("title")} | KANYEL SARL`,
    description: t("subtitle"),
  });
}

export default async function JobOffersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [settings, departments, jobs] = await Promise.all([
    getSettings(),
    getDepartments(),
    getJobOffers(),
  ]);

  return (
    <>
      <Header settings={settings} departments={departments} />
      <JobOffers jobs={jobs} locale={locale as Locale} />
      <Footer settings={settings} departments={departments} locale={locale as Locale} />
    </>
  );
}
