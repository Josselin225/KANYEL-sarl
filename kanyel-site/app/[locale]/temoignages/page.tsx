import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TestimonialsGrid from "@/components/TestimonialsGrid";
import { getDepartments, getSettings, getTestimonials, type Locale } from "@/lib/api";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "testimonials" });
  return pageMetadata({
    locale: locale as Locale,
    path: "/temoignages",
    title: `${t("title")} | KANYEL SARL`,
    description: t("subtitle"),
  });
}

export default async function TestimonialsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [settings, departments, testimonials] = await Promise.all([
    getSettings(),
    getDepartments(),
    getTestimonials(),
  ]);

  return (
    <>
      <Header settings={settings} departments={departments} />
      <TestimonialsGrid testimonials={testimonials} locale={locale as Locale} />
      <Footer settings={settings} departments={departments} locale={locale as Locale} />
    </>
  );
}
