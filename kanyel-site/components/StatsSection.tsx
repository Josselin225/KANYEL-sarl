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
}: {
  stats: ApiStat[];
  settings: ApiSiteSettings | null;
  locale: Locale;
}) {
  const t = useTranslations("stats");

  const items = stats.map((s) => ({
    value: s.value,
    label: pick(s, "label", locale),
  }));

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

        <RevealGroup className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4">
          {items.map((item, i) => (
            <RevealItem key={i} className="text-center">
              <p className="font-display text-4xl font-bold text-gold-light sm:text-5xl">{item.value}</p>
              <p className="mt-2 text-sm text-white/70">{item.label}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
