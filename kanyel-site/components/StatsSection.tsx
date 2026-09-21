"use client";

import { useTranslations } from "next-intl";
import { Reveal, RevealGroup, RevealItem } from "./Reveal";
import { pick, type ApiSiteSettings, type ApiStat, type Locale } from "@/lib/api";

function Kicker({ light = false, children }: { light?: boolean; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] ${
        light ? "bg-white/10 text-gold-light" : "bg-gold-soft text-gold-dark"
      }`}
    >
      {children}
    </span>
  );
}

export default function StatsSection({
  stats,
  settings,
  locale,
  departmentsCount,
  propertiesCount,
  partnersCount,
  realisationsCount,
}: {
  stats: ApiStat[];
  settings: ApiSiteSettings | null;
  locale: Locale;
  departmentsCount: number;
  propertiesCount: number;
  partnersCount: number;
  realisationsCount: number;
}) {
  const t = useTranslations("stats");

  const items = stats.map((s) => ({
    value: s.value,
    label: pick(s, "label", locale),
  }));

  if (realisationsCount > 0) {
    items.push({ value: String(realisationsCount), label: t("realisationsLabel") });
  }
  if (departmentsCount > 0) {
    items.push({ value: String(departmentsCount), label: t("departmentsLabel") });
  }
  if (propertiesCount > 0) {
    items.push({ value: String(propertiesCount), label: t("propertiesLabel") });
  }
  if (partnersCount > 0) {
    items.push({ value: String(partnersCount), label: t("partnersLabel") });
  }

  items.push({
    value: (settings?.visit_count ?? 0).toLocaleString(locale === "en" ? "en-US" : "fr-FR"),
    label: t("visitorsLabel"),
  });

  return (
    <section className="bg-navy-deep py-16">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <Kicker light>{t("kicker")}</Kicker>
          <h2 className="mt-4 font-display text-2xl font-semibold text-white sm:text-3xl">{t("title")}</h2>
        </Reveal>

        <RevealGroup
          className="mt-12 grid gap-x-3 gap-y-6 sm:gap-x-6"
          style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
        >
          {items.map((item, i) => (
            <RevealItem key={i} className="text-center">
              <p className="font-display text-2xl font-bold leading-tight text-gold-light sm:text-4xl lg:text-5xl">
                {item.value}
              </p>
              <p className="mt-2 text-[11px] leading-tight text-white/70 sm:text-sm">{item.label}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
