import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Reveal, RevealGroup, RevealItem } from "./Reveal";
import { pick, type ApiProperty, type Locale, type PropertyCategory } from "@/lib/api";

const CATEGORIES: PropertyCategory[] = ["villa", "appartement", "terrain", "bureau_commerce", "immeuble"];

export default async function PropertiesGrid({
  properties,
  locale,
}: {
  properties: ApiProperty[];
  locale: Locale;
}) {
  const t = await getTranslations({ locale, namespace: "properties" });

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

        <div className="mt-12 space-y-14">
          {CATEGORIES.map((category) => {
            const items = properties.filter((p) => p.category === category);
            return (
              <div key={category}>
                <h3 className="font-display text-xl font-semibold text-navy">{t(category)}</h3>
                {items.length === 0 ? (
                  <p className="mt-3 text-sm text-ink-dim">{t("empty")}</p>
                ) : (
                  <RevealGroup className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((p) => (
                      <RevealItem key={p.id} className="overflow-hidden rounded-3xl bg-white shadow-soft">
                        <div className="relative aspect-[4/3]">
                          <Image src={p.image} alt={pick(p, "title", locale)} fill sizes="(max-width: 1024px) 100vw, 33vw" className="object-cover" />
                        </div>
                        <div className="p-5">
                          <h4 className="font-display text-base font-semibold text-navy">{pick(p, "title", locale)}</h4>
                          {p.location && <p className="mt-1 text-xs text-ink-dim">{p.location}</p>}
                          <p className="mt-2 text-sm leading-relaxed text-ink-dim">{pick(p, "description", locale)}</p>
                          <p className="mt-3 font-display text-sm font-semibold text-gold-dark">
                            {p.price || t("priceOnRequest")}
                          </p>
                        </div>
                      </RevealItem>
                    ))}
                  </RevealGroup>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
