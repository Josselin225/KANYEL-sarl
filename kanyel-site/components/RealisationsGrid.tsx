import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Reveal, RevealGroup, RevealItem } from "./Reveal";
import { pick, type ApiRealisation, type Locale } from "@/lib/api";

function formatDate(dateStr: string, locale: Locale) {
  return new Date(dateStr).toLocaleDateString(locale === "en" ? "en-US" : "fr-FR", {
    year: "numeric",
    month: "long",
  });
}

export default async function RealisationsGrid({
  realisations,
  locale,
}: {
  realisations: ApiRealisation[];
  locale: Locale;
}) {
  const t = await getTranslations({ locale, namespace: "realisations" });

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
          {realisations.length === 0 ? (
            <Reveal className="mx-auto max-w-md rounded-3xl bg-white p-8 text-center shadow-soft">
              <p className="text-sm text-ink-dim">{t("empty")}</p>
            </Reveal>
          ) : (
            <RevealGroup className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {realisations.map((r) => (
                <RevealItem key={r.id} className="overflow-hidden rounded-3xl bg-white shadow-soft">
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={r.image}
                      alt={pick(r, "title", locale)}
                      fill
                      sizes="(max-width: 1024px) 100vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="font-display text-lg font-semibold text-navy">{pick(r, "title", locale)}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-dim">{pick(r, "description", locale)}</p>
                    <div className="mt-4 space-y-1 text-xs text-ink-dim">
                      {r.client_name && (
                        <p>
                          <span className="font-semibold text-gold-dark">{t("clientLabel")} :</span> {r.client_name}
                        </p>
                      )}
                      {r.completed_at && (
                        <p>
                          <span className="font-semibold text-gold-dark">{t("completedLabel")} :</span>{" "}
                          {formatDate(r.completed_at, locale)}
                        </p>
                      )}
                    </div>
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>
          )}
        </div>
      </section>
    </>
  );
}
