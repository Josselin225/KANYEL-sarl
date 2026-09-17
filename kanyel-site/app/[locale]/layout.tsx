import type { Metadata } from "next";
import { Playfair_Display, Manrope } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import ScrollProgress from "@/components/ScrollProgress";
import BackToTop from "@/components/BackToTop";
import FloatingSocials from "@/components/FloatingSocials";
import VisitTracker from "@/components/VisitTracker";
import LocalBusinessJsonLd from "@/components/LocalBusinessJsonLd";
import { getSettings, SITE_URL, type Locale } from "@/lib/api";
import "../globals.css";

const display = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const body = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const title = t("title");
  const description = t("description");
  const url = `${SITE_URL}/${locale}`;

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        fr: `${SITE_URL}/fr`,
        en: `${SITE_URL}/en`,
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "KANYEL SARL",
      locale: locale === "en" ? "en_US" : "fr_FR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const settings = await getSettings();

  return (
    <html lang={locale}>
      <body className={`${display.variable} ${body.variable} antialiased`}>
        <LocalBusinessJsonLd settings={settings} locale={locale as Locale} />
        <NextIntlClientProvider>
          <ScrollProgress />
          <VisitTracker />
          {children}
          <BackToTop />
          <FloatingSocials settings={settings} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
