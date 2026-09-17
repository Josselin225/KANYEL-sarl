import { getTranslations } from "next-intl/server";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { getDepartments, getSettings, type Locale } from "@/lib/api";

export default async function LegalMentionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [settings, departments] = await Promise.all([getSettings(), getDepartments()]);
  const t = await getTranslations({ locale, namespace: "legal" });

  const sections = [1, 2, 3, 4].map((i) => ({
    title: t(`section${i}Title` as never),
    body: t(`section${i}Body` as never),
  }));

  return (
    <>
      <Header settings={settings} departments={departments} />
      <main className="bg-bg py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full bg-gold-soft px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-gold-dark">
              {t("mentionsKicker")}
            </span>
            <h1 className="mt-4 font-display text-3xl font-semibold text-navy sm:text-4xl">{t("mentionsTitle")}</h1>
            <p className="mt-4 text-sm leading-relaxed text-ink-dim">{t("mentionsIntro")}</p>

            <div className="mt-10 space-y-8">
              {sections.map((s) => (
                <div key={s.title}>
                  <h2 className="font-display text-lg font-semibold text-navy">{s.title}</h2>
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-dim">{s.body}</p>
                </div>
              ))}
            </div>

            <a href={`/${locale}`} className="mt-12 inline-flex text-sm font-semibold text-gold-dark hover:underline">
              ← {t("backHome")}
            </a>
          </Reveal>
        </div>
      </main>
      <Footer settings={settings} departments={departments} locale={locale as Locale} />
    </>
  );
}
