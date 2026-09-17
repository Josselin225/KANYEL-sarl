import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Reveal, RevealGroup, RevealItem } from "./Reveal";
import { pick, type ApiTestimonial, type Locale } from "@/lib/api";

export default async function TestimonialsGrid({
  testimonials,
  locale,
}: {
  testimonials: ApiTestimonial[];
  locale: Locale;
}) {
  const t = await getTranslations({ locale, namespace: "testimonials" });

  return (
    <>
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
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          {testimonials.length === 0 ? (
            <Reveal className="mx-auto max-w-md rounded-3xl bg-white p-8 text-center shadow-soft">
              <p className="text-sm text-ink-dim">{t("empty")}</p>
            </Reveal>
          ) : (
            <RevealGroup className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((item) => {
                const initials = item.client_name
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();
                return (
                  <RevealItem key={item.id} className="flex h-full flex-col rounded-3xl bg-white p-7 shadow-soft">
                    <p className="flex-1 text-sm leading-relaxed text-ink-dim">
                      « {pick(item, "message", locale)} »
                    </p>
                    <div className="mt-6 flex items-center gap-3">
                      {item.photo ? (
                        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full">
                          <Image src={item.photo} alt={item.client_name} fill className="object-cover" />
                        </div>
                      ) : (
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-semibold text-white">
                          {initials}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-navy">{item.client_name}</p>
                        {item.city && <p className="text-xs text-ink-dim">{item.city}</p>}
                      </div>
                    </div>
                  </RevealItem>
                );
              })}
            </RevealGroup>
          )}

          <Reveal delay={0.1} className="mt-14 text-center">
            <h2 className="font-display text-xl font-semibold text-navy">{t("ctaTitle")}</h2>
            <a
              href={`/${locale}#contact`}
              className="mt-5 inline-flex rounded-full bg-navy px-7 py-3.5 text-sm font-semibold text-white shadow-soft transition-transform hover:-translate-y-0.5"
            >
              {t("ctaButton")}
            </a>
          </Reveal>
        </div>
      </section>
    </>
  );
}
