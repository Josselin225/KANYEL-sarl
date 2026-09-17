"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Reveal } from "./Reveal";
import type { ApiPartner } from "@/lib/api";

function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-gold-soft px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-gold-dark">
      {children}
    </span>
  );
}

function PartnerLogo({ partner }: { partner: ApiPartner }) {
  const [hover, setHover] = useState(false);

  const content = (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="relative flex h-20 w-40 shrink-0 items-center justify-center rounded-2xl bg-white px-6 shadow-soft"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={partner.logo} alt={partner.name} className="max-h-12 max-w-full object-contain" />
      {hover && (
        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-navy px-3 py-1 text-xs font-semibold text-white shadow-soft">
          {partner.name}
        </span>
      )}
    </div>
  );

  if (partner.website_url) {
    return (
      <a href={partner.website_url} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }
  return content;
}

export default function PartnersMarquee({ partners }: { partners: ApiPartner[] }) {
  const t = useTranslations("partners");
  if (partners.length === 0) return null;

  const doubled = [...partners, ...partners];

  return (
    <section className="bg-bg-alt py-16">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <Kicker>{t("kicker")}</Kicker>
          <h2 className="mt-4 font-display text-2xl font-semibold text-navy sm:text-3xl">{t("title")}</h2>
        </Reveal>
      </div>
      <div className="mt-10 overflow-hidden">
        <div className="animate-marquee flex w-max items-center gap-8 pb-8">
          {doubled.map((p, i) => (
            <PartnerLogo key={`${p.id}-${i}`} partner={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
