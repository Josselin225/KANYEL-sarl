"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "./Logo";
import SearchButton from "./SearchButton";
import { pick, type ApiDepartment, type ApiSiteSettings, type Locale } from "@/lib/api";

function IconPhone() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
      <path
        d="M6.6 10.5c1.4 2.8 3.6 5 6.4 6.4l2.1-2.1c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.5.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.7 21 3 13.3 3 4c0-.6.4-1 1-1h3.8c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.5.1.3 0 .7-.2 1l-2.1 2Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function IconMail() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="m4 6.5 8 6 8-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconClock() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconChevron() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
      <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconMenu({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
      {open ? (
        <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      ) : (
        <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      )}
    </svg>
  );
}

export default function Header({
  settings,
  departments,
}: {
  settings: ApiSiteSettings | null;
  departments: ApiDepartment[];
}) {
  const t = useTranslations("nav");
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activitiesOpen, setActivitiesOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const phone = settings?.phone_1;
  const email = settings?.email_main;
  const hours = (locale === "en" ? settings?.hours_en : settings?.hours_fr) || undefined;

  const navLinks = [
    { href: "/", label: t("home") },
    { href: "/#about", label: t("about") },
    { href: "/#why", label: t("why") },
    { href: "/#gallery", label: t("gallery") },
    { href: "/realisations", label: t("realisations") },
    { href: "/actualites", label: t("articles") },
    { href: "/temoignages", label: t("testimonials") },
    { href: "/offres-emploi", label: t("jobs") },
    { href: "/#contact", label: t("contact") },
  ];

  return (
    <header className="sticky top-0 z-30 w-full">
      {(phone || email || hours) && (
        <div className="hidden bg-navy-deep text-white/85 sm:block">
          <div className="flex items-center justify-between gap-6 px-4 py-2 text-xs sm:px-6 lg:px-10">
            <div className="flex items-center gap-5">
              {phone && (
                <a href={`tel:${phone.replace(/\s+/g, "")}`} className="flex items-center gap-1.5 hover:text-gold-light">
                  <IconPhone />
                  {phone}
                </a>
              )}
              {email && (
                <a href={`mailto:${email}`} className="flex items-center gap-1.5 hover:text-gold-light">
                  <IconMail />
                  {email}
                </a>
              )}
            </div>
            {hours && (
              <div className="flex items-center gap-1.5">
                <IconClock />
                {hours}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="border-b border-border bg-white/95 backdrop-blur">
        <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-10">
          <Link href="/" className="shrink-0">
            <Logo />
          </Link>

          <nav className="hidden items-center gap-0.5 lg:flex xl:gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative whitespace-nowrap px-1.5 py-2 text-sm font-medium text-ink after:absolute after:bottom-0.5 after:left-1.5 after:right-1.5 after:h-0.5 after:origin-left after:scale-x-0 after:bg-gold after:transition-transform after:duration-200 after:content-[''] hover:text-navy hover:after:scale-x-100 xl:px-2"
              >
                {link.label}
              </Link>
            ))}

            <div
              className="relative shrink-0"
              onMouseEnter={() => setActivitiesOpen(true)}
              onMouseLeave={() => setActivitiesOpen(false)}
            >
              <button
                type="button"
                className="relative flex items-center gap-1 whitespace-nowrap px-1.5 py-2 text-sm font-medium text-ink after:absolute after:bottom-0.5 after:left-1.5 after:right-1.5 after:h-0.5 after:origin-left after:scale-x-0 after:bg-gold after:transition-transform after:duration-200 after:content-[''] hover:text-navy hover:after:scale-x-100 xl:px-2"
                aria-haspopup="true"
                aria-expanded={activitiesOpen}
              >
                {t("services")}
                <IconChevron />
              </button>
              <AnimatePresence>
                {activitiesOpen && departments.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 top-full pt-2"
                  >
                    <div className="w-72 overflow-hidden rounded-2xl bg-white p-2 shadow-soft-lg">
                      {departments.map((d) => (
                        <Link
                          key={d.slug}
                          href={`/activites/${d.slug}`}
                          className="block rounded-xl px-3.5 py-2.5 text-sm text-ink hover:bg-navy-soft hover:text-navy"
                        >
                          {pick(d, "title", locale)}
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          <div className="flex shrink-0 items-center gap-2 xl:gap-3">
            <SearchButton />

            <div className="hidden items-center gap-1 rounded-full bg-navy-soft p-1 text-xs font-semibold sm:flex">
              <Link
                href={pathname}
                locale="fr"
                className={`rounded-full px-2.5 py-1 ${locale === "fr" ? "bg-navy text-white" : "text-navy"}`}
              >
                FR
              </Link>
              <Link
                href={pathname}
                locale="en"
                className={`rounded-full px-2.5 py-1 ${locale === "en" ? "bg-navy text-white" : "text-navy"}`}
              >
                EN
              </Link>
            </div>

            <Link
              href="/#contact"
              className="hidden whitespace-nowrap rounded-full bg-navy px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition-transform hover:-translate-y-0.5 sm:inline-flex xl:px-5"
            >
              {t("cta")}
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen((o) => !o)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-navy lg:hidden"
              aria-label={t("subMenu")}
            >
              <IconMenu open={mobileOpen} />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-b border-border bg-white lg:hidden"
          >
            <nav className="flex flex-col gap-1 px-5 py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-xl px-3.5 py-2.5 text-sm font-medium text-ink hover:bg-navy-soft hover:text-navy"
                >
                  {link.label}
                </Link>
              ))}
              {departments.map((d) => (
                <Link
                  key={d.slug}
                  href={`/activites/${d.slug}`}
                  className="rounded-xl px-3.5 py-2.5 pl-7 text-sm text-ink-dim hover:bg-navy-soft hover:text-navy"
                >
                  {pick(d, "title", locale)}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
