import { getTranslations } from "next-intl/server";
import { Reveal } from "./Reveal";
import PropertiesGridClient from "./PropertiesGridClient";
import { groupImagesByProperty, type ApiProperty, type ApiPropertyImage, type Locale } from "@/lib/api";

const T_KEYS = [
  "villa", "appartement", "terrain", "bureau_commerce", "immeuble",
  "priceOnRequest", "empty", "filterAll", "filterLocation", "filterMinPrice",
  "filterMaxPrice", "filterReset", "noResults",
];

export default async function PropertiesGrid({
  properties,
  propertyImages = [],
  locale,
}: {
  properties: ApiProperty[];
  propertyImages?: ApiPropertyImage[];
  locale: Locale;
}) {
  const t = await getTranslations({ locale, namespace: "properties" });
  const strings = Object.fromEntries(T_KEYS.map((key) => [key, t(key)]));
  const imagesByProperty = groupImagesByProperty(propertyImages);

  return (
    <section className="bg-bg py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-gold-soft px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-gold-dark">
            {t("kicker")}
          </span>
          <h2 className="mt-4 font-display text-2xl font-semibold text-navy sm:text-3xl">{t("title")}</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-ink-dim">{t("subtitle")}</p>
        </Reveal>

        <div className="mt-12">
          <PropertiesGridClient
            properties={properties}
            imagesByProperty={imagesByProperty}
            locale={locale}
            t={strings}
          />
        </div>
      </div>
    </section>
  );
}
