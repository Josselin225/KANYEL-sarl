import { getTranslations } from "next-intl/server";
import Logo from "./Logo";
import LogoWatermark from "./LogoWatermark";
import SocialLinks from "./SocialLinks";
import { buildWhatsAppUrl, getArticles, pick, type ApiDepartment, type ApiSiteSettings, type Locale } from "@/lib/api";

function IconLock() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
      <rect x="5" y="10.5" width="14" height="9.5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function IconClock() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 shrink-0">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconWhatsApp() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M17.5 14.4c-.3-.1-1.7-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.4-1.5-.9-.8-1.5-1.8-1.6-2.1-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.1.2-.3.3-.4.1-.2 0-.4 0-.5-.1-.1-.7-1.6-.9-2.2-.2-.5-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1.1 2.8 1.2 3c.1.2 2.2 3.4 5.3 4.7.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.6.2-1.2.2-1.3-.1-.2-.3-.2-.6-.4Z" />
      <path d="M12.03 2C6.5 2 2 6.5 2 12c0 1.8.5 3.5 1.3 5L2 22l5.2-1.4c1.4.8 3.1 1.2 4.8 1.2 5.5 0 10-4.5 10-10S17.6 2 12.03 2Zm0 18.3c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-3.1.8.8-3-.2-.3c-.9-1.4-1.3-3-1.3-4.6 0-4.6 3.8-8.4 8.4-8.4s8.4 3.8 8.4 8.4-3.7 8.5-8.3 8.5Z" />
    </svg>
  );
}

function formatShortDate(dateStr: string, locale: Locale) {
  return new Date(dateStr).toLocaleDateString(locale === "en" ? "en-US" : "fr-FR", {
    day: "2-digit",
    month: "short",
  });
}

export default async function Footer({
  settings,
  departments,
  locale,
  showMap = true,
}: {
  settings: ApiSiteSettings | null;
  departments: ApiDepartment[];
  locale: Locale;
  /** Set to false on pages that already show their own map (e.g. the homepage's Contact section). */
  showMap?: boolean;
}) {
  const t = await getTranslations({ locale, namespace: "footer" });
  const tNav = await getTranslations({ locale, namespace: "nav" });
  const tServices = await getTranslations({ locale, namespace: "services" });
  const tContact = await getTranslations({ locale, namespace: "contact" });

  const year = new Date().getFullYear();

  const companyName = settings?.company_name || "KANYEL SARL";
  const address = pick(settings, "address", locale) || tContact("address");
  const phone = settings?.phone_1;
  const email = settings?.email_main;
  const website = settings?.website || "www.kanyelsarl.com";
  const hours = pick(settings, "hours", locale) || tContact("hours");
  const whatsapp = settings?.whatsapp_number;
  const whatsappHref = whatsapp ? buildWhatsAppUrl(whatsapp, t("whatsappMessage")) : null;

  const mapQuery =
    settings?.latitude != null && settings?.longitude != null
      ? `${settings.latitude},${settings.longitude}`
      : address;
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=15&output=embed`;

  const recentArticles = (await getArticles())
    .slice()
    .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
    .slice(0, 3);

  const quickLinks = [
    { href: `/${locale}`, label: tNav("home") },
    { href: `/${locale}#about`, label: tNav("about") },
    { href: `/${locale}#services`, label: tNav("services") },
    { href: `/${locale}/realisations`, label: tNav("realisations") },
    { href: `/${locale}/actualites`, label: tNav("articles") },
    { href: `/${locale}/temoignages`, label: tNav("testimonials") },
    { href: `/${locale}/offres-emploi`, label: tNav("jobs") },
    { href: `/${locale}/devis`, label: tNav("quoteCta") },
    { href: `/${locale}/faq`, label: tNav("faq") },
    { href: `/${locale}#contact`, label: tNav("contact") },
  ];

  const services =
    departments.length > 0
      ? departments.map((d) => pick(d, "title", locale))
      : [
          tServices("item1Title"),
          tServices("item2Title"),
          tServices("item3Title"),
          tServices("item4Title"),
          tServices("item5Title"),
        ];

  return (
    <footer className="relative overflow-hidden bg-navy-deep py-10 lg:py-14">
      <LogoWatermark className="pointer-events-none absolute -bottom-16 -left-16 h-auto w-80 opacity-[0.06] sm:w-[28rem]" />
      <div className="relative px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo variant="badge" />
            <p className="mt-4 font-display italic text-gold-light">
              {pick(settings, "slogan", locale) || t("tagline")}
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/65">
              {t("description")}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
              {t("quickLinksTitle")}
            </h4>
            <ul className="mt-4 columns-2 gap-x-6 sm:columns-1 lg:columns-2">
              {quickLinks.map((link) => (
                <li key={link.href} className="break-inside-avoid pb-2.5">
                  <a
                    href={link.href}
                    className="text-sm text-white/65 hover:text-gold-light"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
              {t("servicesTitle")}
            </h4>
            <ul className="mt-4 space-y-2.5">
              {services.map((s) => (
                <li key={s} className="text-sm text-white/65">
                  {s}
                </li>
              ))}
            </ul>

            {recentArticles.length > 0 && (
              <>
                <h4 className="mt-6 text-sm font-semibold uppercase tracking-wider text-white">
                  {t("recentArticlesTitle")}
                </h4>
                <ul className="mt-4 space-y-3">
                  {recentArticles.map((a) => (
                    <li key={a.id}>
                      <a href={`/${locale}/actualites/${a.slug}`} className="group block">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gold-light">
                          {formatShortDate(a.published_at, locale)}
                        </p>
                        <p className="mt-1 text-sm text-white/75 group-hover:text-white">
                          {pick(a, "title", locale)}
                        </p>
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
              {t("contactTitle")}
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm text-white/65">
              <li>{address}</li>
              {phone && (
                <li>
                  <a href={`tel:${phone.replace(/\s+/g, "")}`} className="hover:text-gold-light">
                    {phone}
                  </a>
                </li>
              )}
              {email && (
                <li>
                  <a href={`mailto:${email}`} className="hover:text-gold-light">
                    {email}
                  </a>
                </li>
              )}
              <li>{website}</li>
              <li className="flex items-center gap-1.5 pt-1">
                <IconClock />
                {hours}
              </li>
            </ul>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <SocialLinks settings={settings} />
              {whatsappHref && (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-full bg-[#25D366]/15 px-4 py-2 text-sm font-semibold text-[#4ade80] transition-colors hover:bg-[#25D366]/25"
                >
                  <IconWhatsApp />
                  {t("whatsappCta")}
                </a>
              )}
            </div>

            {showMap && (
              <div className="mt-4 overflow-hidden rounded-2xl shadow-soft ring-1 ring-white/10">
                <iframe
                  src={mapSrc}
                  title={t("mapTitle")}
                  loading="lazy"
                  className="h-32 w-full border-0"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 h-px w-full bg-white/10" />

        <div className="mt-6 flex flex-col items-center justify-between gap-3 text-xs text-white/60 sm:flex-row">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 sm:justify-start">
            <p>
              © {year} {companyName} — {t("rights")}
            </p>
            <a href={`/${locale}/mentions-legales`} className="hover:text-gold-light">
              {t("legalMentions")}
            </a>
            <a href={`/${locale}/confidentialite`} className="hover:text-gold-light">
              {t("privacyPolicy")}
            </a>
          </div>
          <div className="flex items-center gap-5">
            <p>{website}</p>
            <a
              href={`/${locale}/admin`}
              className="flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-white/75 transition-colors hover:bg-white/15 hover:text-gold-light"
            >
              <IconLock />
              {t("login")}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
