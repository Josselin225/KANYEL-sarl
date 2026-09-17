import { getTranslations } from "next-intl/server";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuoteForm from "@/components/QuoteForm";
import { Reveal } from "@/components/Reveal";
import { getDepartments, getSettings, type Locale } from "@/lib/api";

export default async function QuotePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [settings, departments] = await Promise.all([getSettings(), getDepartments()]);
  const t = await getTranslations({ locale, namespace: "quote" });

  return (
    <>
      <Header settings={settings} departments={departments} />
      <main className="bg-bg-alt py-16 sm:py-24">
        <div className="mx-auto max-w-2xl px-5 sm:px-8">
          <Reveal className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-gold-soft px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-gold-dark">
              {t("kicker")}
            </span>
            <h1 className="mt-4 font-display text-3xl font-semibold text-navy sm:text-4xl">{t("title")}</h1>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-ink-dim">{t("subtitle")}</p>
          </Reveal>

          <div className="mt-10">
            <QuoteForm departments={departments} locale={locale as Locale} />
          </div>
        </div>
      </main>
      <Footer settings={settings} departments={departments} locale={locale as Locale} />
    </>
  );
}
