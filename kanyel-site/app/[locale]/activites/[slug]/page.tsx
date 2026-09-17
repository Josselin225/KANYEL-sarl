import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Reveal, RevealGroup, RevealItem } from "@/components/Reveal";
import PropertiesGrid from "@/components/PropertiesGrid";
import FAQAccordion from "@/components/FAQAccordion";
import {
  getDepartmentImages,
  getDepartments,
  getFAQs,
  getProperties,
  getSettings,
  pick,
  type Locale,
} from "@/lib/api";

export default async function DepartmentDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const [departments, settings, images, allFaqs] = await Promise.all([
    getDepartments(),
    getSettings(),
    getDepartmentImages(slug),
    getFAQs(),
  ]);
  const faqs = allFaqs.filter((f) => f.department === slug);

  const department = departments.find((d) => d.slug === slug);
  if (!department) notFound();

  const t = await getTranslations({ locale, namespace: "departmentDetail" });
  const tGallery = await getTranslations({ locale, namespace: "departmentGallery" });
  const tFaq = await getTranslations({ locale, namespace: "faq" });

  const properties = department.has_property_listing ? await getProperties() : [];

  const title = pick(department, "title", locale as Locale);
  const content =
    pick(department, "detail_content", locale as Locale) || pick(department, "description", locale as Locale);

  return (
    <>
      <Header settings={settings} departments={departments} />
      <main>
        <section className="relative flex h-[50vh] min-h-[380px] w-full items-end overflow-hidden">
          {department.detail_image && (
            <Image src={department.detail_image} alt={title} fill priority sizes="100vw" className="object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/90 via-navy-deep/30 to-navy-deep/50" />
          <div className="relative mx-auto w-full max-w-5xl px-5 pb-14 sm:px-8">
            <a href={`/${locale}#services`} className="text-sm font-semibold text-gold-light hover:underline">
              ← {t("back")}
            </a>
            <h1 className="mt-4 font-display text-4xl font-semibold text-white sm:text-5xl">{title}</h1>
          </div>
        </section>

        <section className="bg-bg py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-5 sm:px-8">
            <Reveal>
              <p className="whitespace-pre-line text-base leading-relaxed text-ink-dim">{content}</p>
            </Reveal>
          </div>
        </section>

        {images.length > 0 && (
          <section className="bg-bg-alt py-16 sm:py-20">
            <div className="mx-auto max-w-6xl px-5 sm:px-8">
              <Reveal className="mx-auto max-w-xl text-center">
                <span className="inline-flex items-center gap-2 rounded-full bg-gold-soft px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-gold-dark">
                  {tGallery("kicker")}
                </span>
                <h2 className="mt-4 font-display text-2xl font-semibold text-navy sm:text-3xl">
                  {tGallery("title")}
                </h2>
              </Reveal>
              <RevealGroup className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {images.map((img) => (
                  <RevealItem key={img.id} className="relative aspect-square overflow-hidden rounded-2xl">
                    <Image
                      src={img.image}
                      alt={pick(img, "caption", locale as Locale) || title}
                      fill
                      sizes="(max-width: 640px) 50vw, 25vw"
                      className="object-cover"
                    />
                  </RevealItem>
                ))}
              </RevealGroup>
            </div>
          </section>
        )}

        {department.has_property_listing && <PropertiesGrid properties={properties} locale={locale as Locale} />}

        {faqs.length > 0 && (
          <section className="bg-bg py-16 sm:py-20">
            <div className="mx-auto max-w-3xl px-5 sm:px-8">
              <Reveal className="text-center">
                <span className="inline-flex items-center gap-2 rounded-full bg-gold-soft px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-gold-dark">
                  {tFaq("kicker")}
                </span>
                <h2 className="mt-4 font-display text-2xl font-semibold text-navy sm:text-3xl">{tFaq("title")}</h2>
              </Reveal>
              <div className="mt-8">
                <FAQAccordion items={faqs} locale={locale as Locale} />
              </div>
            </div>
          </section>
        )}

        <section className="bg-navy-deep py-16 text-center sm:py-20">
          <div className="mx-auto max-w-2xl px-5 sm:px-8">
            <Reveal>
              <h2 className="font-display text-2xl font-semibold text-white sm:text-3xl">{t("ctaTitle")}</h2>
              <a
                href={`/${locale}#contact`}
                className="mt-6 inline-flex rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-navy shadow-soft-lg transition-transform hover:-translate-y-0.5"
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
