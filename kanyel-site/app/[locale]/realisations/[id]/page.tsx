import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import RealisationJsonLd from "@/components/RealisationJsonLd";
import RealisationDetailClient from "@/components/RealisationDetailClient";
import {
  getDepartments,
  getRealisationImages,
  getRealisations,
  getSettings,
  pick,
  type Locale,
} from "@/lib/api";
import { pageMetadata } from "@/lib/seo";

async function findRealisation(id: string) {
  const realisations = await getRealisations();
  return realisations.find((r) => String(r.id) === id) ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const realisation = await findRealisation(id);
  if (!realisation) return {};

  return pageMetadata({
    locale: locale as Locale,
    path: `/realisations/${id}`,
    title: `${pick(realisation, "title", locale as Locale)} | KANYEL SARL`,
    description: pick(realisation, "description", locale as Locale),
    image: realisation.image,
  });
}

export default async function RealisationDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const [settings, departments, realisation, allImages] = await Promise.all([
    getSettings(),
    getDepartments(),
    findRealisation(id),
    getRealisationImages(),
  ]);

  if (!realisation) notFound();

  const images = allImages.filter((img) => img.realisation === realisation.id).sort((a, b) => a.order - b.order);

  const t = await getTranslations({ locale, namespace: "realisations" });
  const tShare = await getTranslations({ locale, namespace: "share" });

  const title = pick(realisation, "title", locale as Locale);
  const department = departments.find((d) => d.slug === realisation.department);

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString(locale === "en" ? "en-US" : "fr-FR", {
      year: "numeric",
      month: "long",
    });
  }

  return (
    <>
      <RealisationJsonLd realisation={realisation} locale={locale as Locale} />
      <Header settings={settings} departments={departments} />
      <main>
        <section className="relative flex h-[50vh] min-h-[380px] w-full items-end overflow-hidden">
          <Image src={realisation.image} alt={title} fill priority sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/90 via-navy-deep/30 to-navy-deep/50" />
          <div className="relative mx-auto w-full max-w-5xl px-5 pb-14 sm:px-8">
            <a href={`/${locale}/realisations`} className="text-sm font-semibold text-gold-light hover:underline">
              ← {t("back")}
            </a>
            <h1 className="mt-4 font-display text-4xl font-semibold text-white sm:text-5xl">{title}</h1>
            {realisation.location && <p className="mt-2 text-white/80">{realisation.location}</p>}
          </div>
        </section>

        <section className="bg-bg py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-5 sm:px-8">
            <Reveal>
              {department && (
                <p className="inline-block rounded-full bg-gold-soft px-3.5 py-1 text-xs font-semibold uppercase tracking-wide text-gold-dark">
                  {pick(department, "title", locale as Locale)}
                </p>
              )}
              <p className="mt-6 whitespace-pre-line text-base leading-relaxed text-ink-dim">
                {pick(realisation, "description", locale as Locale)}
              </p>

              <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {realisation.client_name && (
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-ink-dim">
                      {t("clientLabel")}
                    </dt>
                    <dd className="mt-1 text-sm text-ink">{realisation.client_name}</dd>
                  </div>
                )}
                {realisation.location && (
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-ink-dim">
                      {t("locationLabel")}
                    </dt>
                    <dd className="mt-1 text-sm text-ink">{realisation.location}</dd>
                  </div>
                )}
                {realisation.completed_at && (
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-ink-dim">
                      {t("completedLabel")}
                    </dt>
                    <dd className="mt-1 text-sm text-ink">{formatDate(realisation.completed_at)}</dd>
                  </div>
                )}
              </dl>
            </Reveal>

            <RealisationDetailClient
              realisation={realisation}
              images={images}
              locale={locale as Locale}
              shareLabels={{ label: tShare("label"), whatsapp: tShare("whatsapp"), facebook: tShare("facebook") }}
            />
          </div>
        </section>
      </main>
      <Footer settings={settings} departments={departments} locale={locale as Locale} />
    </>
  );
}
