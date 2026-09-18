import { getTranslations } from "next-intl/server";
import { Reveal } from "./Reveal";
import RealisationsGridClient from "./RealisationsGridClient";
import { groupImagesByRealisation, type ApiRealisation, type ApiRealisationImage, type Locale } from "@/lib/api";

export default async function RealisationsGrid({
  realisations,
  realisationImages = [],
  locale,
}: {
  realisations: ApiRealisation[];
  realisationImages?: ApiRealisationImage[];
  locale: Locale;
}) {
  const t = await getTranslations({ locale, namespace: "realisations" });
  const tShare = await getTranslations({ locale, namespace: "share" });
  const imagesByRealisation = groupImagesByRealisation(realisationImages);

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
            <RealisationsGridClient
              realisations={realisations}
              imagesByRealisation={imagesByRealisation}
              locale={locale}
              t={{
                clientLabel: t("clientLabel"),
                completedLabel: t("completedLabel"),
                shareLabel: tShare("label"),
                shareWhatsapp: tShare("whatsapp"),
                shareFacebook: tShare("facebook"),
              }}
            />
          )}
        </div>
      </section>
    </>
  );
}
