import { useTranslations } from "next-intl";
import Logo from "./Logo";
import LogoWatermark from "./LogoWatermark";
import SocialLinks from "./SocialLinks";
import { pick, type ApiDepartment, type ApiSiteSettings, type Locale } from "@/lib/api";

function IconLock() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
      <rect x="5" y="10.5" width="14" height="9.5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export default function Footer({
  settings,
  departments,
  locale,
}: {
  settings: ApiSiteSettings | null;
  departments: ApiDepartment[];
  locale: Locale;
}) {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");
  const tServices = useTranslations("services");
  const tContact = useTranslations("contact");

  const year = new Date().getFullYear();

  const companyName = settings?.company_name || "KANYEL SARL";
  const address = pick(settings, "address", locale) || tContact("address");
  const phone = settings?.phone_1;
  const email = settings?.email_main;
  const website = settings?.website || "www.kanyelsarl.com";

  const quickLinks = [
    { href: `/${locale}`, label: tNav("home") },
    { href: `/${locale}#about`, label: tNav("about") },
    { href: `/${locale}#services`, label: tNav("services") },
    { href: `/${locale}/temoignages`, label: tNav("testimonials") },
    { href: `/${locale}/offres-emploi`, label: tNav("jobs") },
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
          tServices("item6Title"),
        ];

  return (
    <footer className="relative overflow-hidden bg-navy-deep py-16">
      <LogoWatermark className="pointer-events-none absolute -bottom-16 -left-16 h-auto w-80 opacity-[0.06] sm:w-[28rem]" />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
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
            <ul className="mt-4 space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
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
            </ul>
            <SocialLinks settings={settings} className="mt-4" />
          </div>
        </div>

        <div className="mt-12 h-px w-full bg-white/10" />

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
