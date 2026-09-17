import { getTranslations } from "next-intl/server";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FAQAccordion from "@/components/FAQAccordion";
import { Reveal } from "@/components/Reveal";
import { getDepartments, getFAQs, getSettings, pick, type Locale } from "@/lib/api";

export default async function FAQPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [settings, departments, faqs] = await Promise.all([
    getSettings(),
    getDepartments(),
    getFAQs(),
  ]);

  const t = await getTranslations({ locale, namespace: "faq" });

  const generalFaqs = faqs.filter((f) => !f.department);
  const byDepartment = departments
    .map((d) => ({ department: d, items: faqs.filter((f) => f.department === d.slug) }))
    .filter((g) => g.items.length > 0);

  return (
    <>
      <Header settings={settings} departments={departments} />
      <main>
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
          <div className="mx-auto max-w-3xl px-5 sm:px-8">
            {faqs.length === 0 ? (
              <Reveal className="rounded-3xl bg-white p-8 text-center shadow-soft">
                <p className="text-sm text-ink-dim">{t("empty")}</p>
              </Reveal>
            ) : (
              <div className="space-y-12">
                {generalFaqs.length > 0 && (
                  <div>
                    <Reveal>
                      <h2 className="font-display text-xl font-semibold text-navy">{t("generalTitle")}</h2>
                    </Reveal>
                    <div className="mt-5">
                      <FAQAccordion items={generalFaqs} locale={locale as Locale} />
                    </div>
                  </div>
                )}
                {byDepartment.map(({ department, items }) => (
                  <div key={department.slug}>
                    <Reveal>
                      <h2 className="font-display text-xl font-semibold text-navy">
                        {pick(department, "title", locale as Locale)}
                      </h2>
                    </Reveal>
                    <div className="mt-5">
                      <FAQAccordion items={items} locale={locale as Locale} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Reveal delay={0.1} className="mt-14 text-center">
              <h2 className="font-display text-lg font-semibold text-navy">{t("ctaTitle")}</h2>
              <a
                href={`/${locale}#contact`}
                className="mt-5 inline-flex rounded-full bg-navy px-7 py-3.5 text-sm font-semibold text-white shadow-soft transition-transform hover:-translate-y-0.5"
              >
                {t("ctaButton")}
              </a>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer settings={settings} departments={departments} locale={locale as Locale} />
    </>
  );
}
