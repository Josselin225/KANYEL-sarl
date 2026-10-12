import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import PropertyJsonLd from "@/components/PropertyJsonLd";
import PropertyDetailClient from "@/components/PropertyDetailClient";
import {
  getDepartments,
  getProperties,
  getPropertyImages,
  getSettings,
  pick,
  type Locale,
} from "@/lib/api";
import { pageMetadata } from "@/lib/seo";

const T_KEYS = ["requestVisit", "back", "galleryTitle", "priceOnRequest", "villa", "appartement", "terrain", "bureau_commerce", "immeuble"];

async function findProperty(id: string) {
  const properties = await getProperties();
  return properties.find((p) => String(p.id) === id) ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const property = await findProperty(id);
  if (!property) return {};

  return pageMetadata({
    locale: locale as Locale,
    path: `/biens/${id}`,
    title: `${pick(property, "title", locale as Locale)} | KANYEL SARL`,
    description: pick(property, "description", locale as Locale),
    image: property.image,
  });
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const [settings, departments, property, allImages] = await Promise.all([
    getSettings(),
    getDepartments(),
    findProperty(id),
    getPropertyImages(),
  ]);

  if (!property) notFound();

  const images = allImages.filter((img) => img.property === property.id).sort((a, b) => a.order - b.order);

  const t = await getTranslations({ locale, namespace: "properties" });
  const strings = Object.fromEntries(T_KEYS.map((key) => [key, t(key)]));

  const title = pick(property, "title", locale as Locale);
  const propertyDept = departments.find((d) => d.has_property_listing);

  return (
    <>
      <PropertyJsonLd property={property} locale={locale as Locale} />
      <Header settings={settings} departments={departments} />
      <main>
        <section className="relative flex h-[50vh] min-h-[380px] w-full items-end overflow-hidden">
          <Image src={property.image} alt={title} fill priority sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/90 via-navy-deep/30 to-navy-deep/50" />
          <div className="relative mx-auto w-full max-w-5xl px-5 pb-14 sm:px-8">
            {propertyDept && (
              <a href={`/${locale}/activites/${propertyDept.slug}`} className="text-sm font-semibold text-gold-light hover:underline">
                ← {strings.back}
              </a>
            )}
            <h1 className="mt-4 font-display text-4xl font-semibold text-white sm:text-5xl">{title}</h1>
            {property.location && <p className="mt-2 text-white/80">{property.location}</p>}
          </div>
        </section>

        <section className="bg-bg py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-5 sm:px-8">
            <Reveal>
              <p className="font-display text-2xl font-semibold text-gold-dark">
                {property.price || strings.priceOnRequest}
              </p>
              <p className="mt-2 inline-block rounded-full bg-gold-soft px-3.5 py-1 text-xs font-semibold uppercase tracking-wide text-gold-dark">
                {strings[property.category]}
              </p>
              <p className="mt-6 whitespace-pre-line text-base leading-relaxed text-ink-dim">
                {pick(property, "description", locale as Locale)}
              </p>
            </Reveal>

            <PropertyDetailClient property={property} images={images} locale={locale as Locale} t={strings} />
          </div>
        </section>
      </main>
      <Footer settings={settings} departments={departments} locale={locale as Locale} />
    </>
  );
}
