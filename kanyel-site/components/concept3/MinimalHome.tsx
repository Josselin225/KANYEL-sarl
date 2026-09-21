"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Reveal, RevealGroup, RevealItem } from "../Reveal";
import WaveDivider from "../WaveDivider";
import Marquee from "../Marquee";
import StatsSection from "../StatsSection";
import PartnersMarquee from "../PartnersMarquee";
import { ICON_MAP } from "../Icons";
import {
  pick,
  type ApiCredential,
  type ApiDepartment,
  type ApiGalleryItem,
  type ApiPartner,
  type ApiProperty,
  type ApiRealisation,
  type ApiSiteSettings,
  type ApiStat,
  type Locale,
} from "@/lib/api";

import btp from "@/public/images/gallery/btp.jpg";

const DEFAULT_ICONS = ["plot", "building", "globe", "truck", "home"] as const;

function Kicker({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] ${
        light ? "bg-white/10 text-gold-light backdrop-blur" : "bg-gold-soft text-gold-dark"
      }`}
    >
      {children}
    </span>
  );
}

export default function MinimalHome({
  settings,
  departments,
  credentials,
  gallery,
  stats,
  partners,
  properties,
  realisations,
  locale,
}: {
  settings: ApiSiteSettings | null;
  departments: ApiDepartment[];
  credentials: ApiCredential[];
  gallery: ApiGalleryItem[];
  stats: ApiStat[];
  partners: ApiPartner[];
  properties: ApiProperty[];
  realisations: ApiRealisation[];
  locale: Locale;
}) {
  const t = useTranslations("hero");
  const tAbout = useTranslations("about");
  const tServices = useTranslations("services");
  const tWhy = useTranslations("why");
  const tGallery = useTranslations("gallery");

  const heroImage = settings?.hero_image || btp;
  const title = pick(settings, "hero_title", locale) || t("title");
  const aboutImage = settings?.about_image || btp;
  const leaderPhoto = settings?.leader_photo;
  const leaderInitials = (settings?.leader_name || "Konan KANYEL")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const displayedDepartments =
    departments.length > 0
      ? departments
      : DEFAULT_ICONS.map((icon, i) => ({
          id: -1 - i,
          order: i,
          slug: "",
          icon,
          accent: (i % 2 === 0 ? "navy" : "gold") as "navy" | "gold",
          title_fr: tServices(`item${i + 1}Title` as never),
          title_en: tServices(`item${i + 1}Title` as never),
          description_fr: tServices(`item${i + 1}Desc` as never),
          description_en: tServices(`item${i + 1}Desc` as never),
          detail_content_fr: "",
          detail_content_en: "",
          detail_image: null,
          has_property_listing: false,
          is_published: true,
        }));

  const marqueeItems =
    departments.length > 0
      ? departments.map((d) => pick(d, "title", locale).toUpperCase())
      : [1, 2, 3, 4, 5, 6].map((i) => tServices(`item${i}Title` as never).toUpperCase());

  const whyItems = [1, 2, 3, 4, 5, 6].map((i) => ({
    title: tWhy(`item${i}Title` as never),
    desc: tWhy(`item${i}Desc` as never),
  }));


  return (
    <main id="top">
      {/* HERO */}
      <section id="home" className="relative flex h-[85vh] min-h-[520px] w-full items-end overflow-hidden">
        <Image src={heroImage} alt={t("imageAlt")} fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/90 via-navy-deep/25 to-navy-deep/40" />
        <div className="relative mx-auto w-full max-w-7xl px-6 pb-16 sm:px-10 sm:pb-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <Kicker light>{t("kicker")}</Kicker>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 max-w-3xl font-display text-5xl font-semibold leading-[1.05] text-white sm:text-6xl md:text-7xl"
          >
            {title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 font-display text-xl italic text-gold-light sm:text-2xl"
          >
            « {pick(settings, "slogan", locale) || t("slogan")} »
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="mt-4 max-w-xl text-base text-white/80 sm:text-lg"
          >
            {pick(settings, "hero_subtitle", locale) || t("subtitle")}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 flex flex-wrap gap-4"
          >
            <Link
              href="#services"
              className="rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-navy shadow-soft-lg transition-transform hover:-translate-y-0.5"
            >
              {t("ctaPrimary")}
            </Link>
            <Link
              href="/devis"
              className="rounded-full border border-white/40 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              {t("ctaSecondary")}
            </Link>
          </motion.div>
        </div>

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 left-1/2 z-10 -translate-x-1/2 text-white/70 sm:bottom-24"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
            <path d="M12 4v14m0 0-6-6m6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.div>

        <WaveDivider className="absolute bottom-0 left-0 z-10 h-16 w-full sm:h-24" />
      </section>

      <Marquee items={marqueeItems} />

      {/* ABOUT */}
      <section id="about" className="bg-bg py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <Reveal className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-soft-lg">
              <Image
                src={aboutImage}
                alt={settings?.about_image_caption || tAbout("imageCaption")}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-navy shadow-soft">
                {settings?.about_image_caption || tAbout("imageCaption")}
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <Kicker>{tAbout("kicker")}</Kicker>
              <h2 className="mt-4 font-display text-3xl font-semibold leading-tight text-navy sm:text-4xl">
                {tAbout("title")}
              </h2>
              <p className="mt-5 text-base leading-relaxed text-ink-dim">
                {pick(settings, "about_paragraph_1", locale) || tAbout("paragraph1")}
              </p>
              <p className="mt-4 text-base leading-relaxed text-ink-dim">
                {pick(settings, "about_paragraph_2", locale) || tAbout("paragraph2")}
              </p>

              <div className="mt-8 flex items-center gap-4 rounded-2xl bg-bg-alt p-5">
                {leaderPhoto ? (
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full">
                    <Image src={leaderPhoto} alt={settings?.leader_name || ""} fill sizes="64px" className="object-cover" />
                  </div>
                ) : (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-navy text-lg font-semibold text-white">
                    {leaderInitials}
                  </div>
                )}
                <div>
                  <p className="font-display text-lg font-semibold text-navy">
                    {settings?.leader_name || tAbout("leaderTitle")}
                  </p>
                  <p className="text-sm text-ink-dim">
                    {pick(settings, "leader_role", locale) || tAbout("leaderRole")}
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        {(settings?.ceo_message_fr || settings?.ceo_message_en) && (
          <Reveal delay={0.15} className="mt-16 bg-navy-deep py-14 sm:py-20">
            <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-5 sm:px-8 lg:grid-cols-[320px_1fr] lg:gap-16">
              <div className="relative mx-auto aspect-[4/5] w-full max-w-xs overflow-hidden rounded-3xl shadow-soft-lg lg:mx-0">
                {leaderPhoto ? (
                  <Image
                    src={leaderPhoto}
                    alt={settings?.leader_name || ""}
                    fill
                    sizes="(max-width: 1024px) 60vw, 320px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-navy font-display text-5xl font-semibold text-white">
                    {leaderInitials}
                  </div>
                )}
              </div>
              <div>
                <Kicker light>{tAbout("ceoKicker")}</Kicker>
                <p className="mt-5 font-display text-xl italic leading-relaxed text-white sm:text-2xl">
                  « {pick(settings, "ceo_message", locale) || tAbout("ceoMessage")} »
                </p>
                <p className="mt-6 font-display text-base font-semibold text-gold-light">
                  {settings?.leader_name || tAbout("leaderTitle")}
                </p>
                <p className="text-sm text-white/60">
                  {pick(settings, "leader_role", locale) || tAbout("leaderRole")}
                </p>
              </div>
            </div>
          </Reveal>
        )}

        {credentials.length > 0 && (
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="mt-16">
              <Reveal className="text-center">
                <h3 className="font-display text-2xl font-semibold text-navy">{tAbout("credTitle")}</h3>
              </Reveal>
              <RevealGroup className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
                {credentials.map((c) => (
                  <RevealItem key={c.id} className="rounded-3xl bg-white p-6 shadow-soft">
                    <h4 className="font-display text-base font-semibold text-navy">{pick(c, "title", locale)}</h4>
                    <p className="mt-2 text-sm leading-relaxed text-ink-dim">{pick(c, "description", locale)}</p>
                  </RevealItem>
                ))}
              </RevealGroup>
            </div>
          </div>
        )}
      </section>

      {/* SERVICES */}
      <section id="services" className="bg-bg-alt py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <Kicker>{tServices("kicker")}</Kicker>
            <h2 className="mt-4 font-display text-3xl font-semibold leading-tight text-navy sm:text-4xl">
              {tServices("title")}
            </h2>
            <p className="mt-4 font-display text-lg italic text-gold-dark">{tServices("quote")}</p>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-ink-dim">{tServices("subtitle")}</p>
          </Reveal>

          <RevealGroup className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {displayedDepartments.map((d) => {
              const Icon = ICON_MAP[d.icon];
              const accentBg = d.accent === "gold" ? "bg-gold-soft text-gold-dark" : "bg-navy-soft text-navy";
              return (
                <RevealItem key={d.id}>
                  <Link
                    href={d.slug ? `/activites/${d.slug}` : "#services"}
                    className="group flex h-full flex-col rounded-3xl bg-white p-7 shadow-soft transition-transform hover:-translate-y-1"
                  >
                    <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${accentBg}`}>
                      <Icon />
                    </span>
                    <h3 className="mt-5 font-display text-lg font-semibold text-navy">{pick(d, "title", locale)}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-dim">{pick(d, "description", locale)}</p>
                    {d.slug && (
                      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-dark">
                        {tServices("readMore")}
                        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 transition-transform group-hover:translate-x-1">
                          <path d="M5 12h14m0 0-6-6m6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    )}
                  </Link>
                </RevealItem>
              );
            })}
          </RevealGroup>

          <Reveal delay={0.1} className="mt-10 text-center text-sm text-ink-dim">
            {tServices("footnote")}
          </Reveal>
        </div>
      </section>

      {/* WHY */}
      <section id="why" className="bg-bg py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <Kicker>{tWhy("kicker")}</Kicker>
            <h2 className="mt-4 font-display text-3xl font-semibold leading-tight text-navy sm:text-4xl">
              {tWhy("title")}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-ink-dim">{tWhy("subtitle")}</p>
          </Reveal>

          <RevealGroup className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {whyItems.map((item, i) => (
              <RevealItem key={i} className="rounded-3xl bg-bg-alt p-7">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-navy font-display text-sm font-bold text-white">
                  {i + 1}
                </span>
                <h3 className="mt-5 font-display text-lg font-semibold text-navy">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-dim">{item.desc}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* GALLERY */}
      {gallery.length > 0 && (
        <section id="gallery" className="bg-bg-alt py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <Reveal className="mx-auto max-w-2xl text-center">
              <Kicker>{tGallery("kicker")}</Kicker>
              <h2 className="mt-4 font-display text-3xl font-semibold leading-tight text-navy sm:text-4xl">
                {tGallery("title")}
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-ink-dim">{tGallery("subtitle")}</p>
            </Reveal>

            <RevealGroup className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {gallery.map((item) => {
                const label = pick(item, "label", locale);
                return (
                  <RevealItem key={item.id} className="group relative aspect-square overflow-hidden rounded-2xl">
                    <Image
                      src={item.image}
                      alt={label}
                      fill
                      sizes="(max-width: 640px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/80 via-navy-deep/10 to-transparent" />
                    <p className="absolute bottom-3 left-3 right-3 text-sm font-semibold text-white">{label}</p>
                  </RevealItem>
                );
              })}
            </RevealGroup>
          </div>
        </section>
      )}

      <StatsSection
        stats={stats}
        settings={settings}
        locale={locale}
        departmentsCount={departments.length}
        propertiesCount={properties.length}
        partnersCount={partners.length}
        realisationsCount={realisations.length}
      />
      <PartnersMarquee partners={partners} />
    </main>
  );
}
