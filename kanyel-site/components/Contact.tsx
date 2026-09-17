"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { Reveal } from "./Reveal";
import { pick, type ApiSiteSettings, type Locale } from "@/lib/api";

import btp from "@/public/images/gallery/btp.jpg";

const FALLBACK_EMAIL = "kanyelsarl3@gmail.com";
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

function IconPin() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5">
      <path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="12" cy="9.5" r="2.3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
function IconPhone() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5">
      <path
        d="M6.6 10.5c1.4 2.8 3.6 5 6.4 6.4l2.1-2.1c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.5.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.7 21 3 13.3 3 4c0-.6.4-1 1-1h3.8c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.5.1.3 0 .7-.2 1l-2.1 2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function IconMail() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="m4 6.5 8 6 8-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconClock() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconChevronDown() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5">
      <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-gold-soft px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-gold-dark">
      {children}
    </span>
  );
}

export default function Contact({ settings }: { settings: ApiSiteSettings | null }) {
  const t = useTranslations("contact");
  const locale = useLocale() as Locale;
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  const contactEmail = settings?.email_main || FALLBACK_EMAIL;
  const address = pick(settings, "address", locale) || t("address");
  const mapQuery =
    settings?.latitude != null && settings?.longitude != null
      ? `${settings.latitude},${settings.longitude}`
      : address;
  const phones = [settings?.phone_1, settings?.phone_2, settings?.phone_3].filter(
    (p): p is string => Boolean(p)
  );
  const emails = [settings?.email_main, settings?.email_leader].filter(
    (e): e is string => Boolean(e)
  );
  const hours = (locale === "en" ? settings?.hours_en : settings?.hours_fr) || t("hours");
  const contactImage = settings?.hero_image || btp;
  const companyName = settings?.company_name || "KANYEL SARL";

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") ?? "");
    const email = String(form.get("email") ?? "");
    const phone = String(form.get("phone") ?? "");
    const subject = String(form.get("subject") ?? "");
    const message = String(form.get("message") ?? "");
    const website = String(form.get("website") ?? "");

    setSending(true);
    try {
      await fetch(`${API_URL}/api/contact/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, subject, message, website }),
      });
    } catch {
      // Non-blocking: the mailto: fallback below is the primary delivery path.
    } finally {
      setSending(false);
    }

    const body = [
      `${t("formName")}: ${name}`,
      `${t("formEmail")}: ${email}`,
      `${t("formPhone")}: ${phone}`,
      `${t("formSubject")}: ${subject}`,
      "",
      message,
    ].join("\n");

    window.location.href = `mailto:${contactEmail}?subject=${encodeURIComponent(
      `[KANYEL SARL] ${subject || "Contact"}`
    )}&body=${encodeURIComponent(body)}`;
    setSent(true);
  }

  return (
    <section id="contact" className="relative bg-bg-alt/60 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <Kicker>{t("kicker")}</Kicker>
          <h2 className="mt-4 font-display text-3xl font-semibold leading-tight text-navy sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-ink-dim">
            {t("subtitle")}
          </p>
        </Reveal>

        <div className="mx-auto mt-14 max-w-4xl space-y-6">
          <Reveal className="grid grid-cols-1 overflow-hidden rounded-3xl bg-white shadow-soft sm:grid-cols-5">
            <div className="relative aspect-[4/3] sm:col-span-2 sm:aspect-auto">
              <Image
                src={contactImage}
                alt={companyName}
                fill
                sizes="(max-width: 640px) 100vw, 320px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/70 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-navy shadow-soft">
                Yamoussoukro, Côte d&apos;Ivoire
              </div>
            </div>

            <ul className="divide-y divide-border p-6 sm:col-span-3 sm:p-7">
              <li className="flex items-start gap-3 py-3 first:pt-0">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy-soft text-navy">
                  <IconPin />
                </span>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-gold-dark">
                    {t("addressLabel")}
                  </div>
                  <div className="mt-0.5 text-sm text-ink-dim">{address}</div>
                </div>
              </li>
              <li className="flex items-start gap-3 py-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy-soft text-navy">
                  <IconPhone />
                </span>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-gold-dark">
                    {t("phoneLabel")}
                  </div>
                  {phones.map((phone) => (
                    <a
                      key={phone}
                      href={`tel:${phone.replace(/\s+/g, "")}`}
                      className="mt-0.5 block text-sm text-ink-dim hover:text-navy"
                    >
                      {phone}
                    </a>
                  ))}
                </div>
              </li>
              <li className="flex items-start gap-3 py-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy-soft text-navy">
                  <IconMail />
                </span>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-gold-dark">
                    {t("emailLabel")}
                  </div>
                  {emails.map((email) => (
                    <a
                      key={email}
                      href={`mailto:${email}`}
                      className="mt-0.5 block text-sm text-ink-dim hover:text-navy"
                    >
                      {email}
                    </a>
                  ))}
                </div>
              </li>
              <li className="flex items-start gap-3 py-3 last:pb-0">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy-soft text-navy">
                  <IconClock />
                </span>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-gold-dark">
                    {t("hoursLabel")}
                  </div>
                  <div className="mt-0.5 text-sm text-ink-dim">{hours}</div>
                </div>
              </li>
            </ul>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="rounded-3xl bg-white shadow-soft">
              <button
                type="button"
                onClick={() => setFormOpen((open) => !open)}
                aria-expanded={formOpen}
                className="flex w-full items-center justify-between gap-4 p-6 text-left sm:p-8"
              >
                <div>
                  <h3 className="font-display text-lg font-semibold text-navy">
                    {t("formToggleTitle")}
                  </h3>
                  <p className="mt-1 text-sm text-ink-dim">{t("formToggleSubtitle")}</p>
                </div>
                <motion.span
                  animate={{ rotate: formOpen ? 180 : 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy-soft text-navy"
                >
                  <IconChevronDown />
                </motion.span>
              </button>

              <AnimatePresence initial={false}>
                {formOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <form
                      onSubmit={handleSubmit}
                      className="space-y-4 px-6 pb-6 sm:px-8 sm:pb-8"
                    >
                      <input
                        type="text"
                        name="website"
                        tabIndex={-1}
                        autoComplete="off"
                        aria-hidden="true"
                        className="absolute left-[-9999px] h-0 w-0 opacity-0"
                      />
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Field name="name" label={t("formName")} required />
                        <Field name="email" label={t("formEmail")} type="email" required />
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Field name="phone" label={t("formPhone")} type="tel" required />
                        <Field name="subject" label={t("formSubject")} />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-dim">
                          {t("formMessage")}
                          <span className="text-gold-dark"> *</span>
                        </label>
                        <textarea
                          name="message"
                          required
                          rows={5}
                          className="w-full rounded-xl border border-border bg-bg px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-navy"
                        />
                      </div>
                      <p className="text-xs text-ink-dim">
                        <span className="text-gold-dark">*</span> {t("requiredLegend")}
                      </p>
                      <motion.button
                        type="submit"
                        disabled={sending}
                        whileHover={sending ? undefined : { scale: 1.02, y: -2 }}
                        whileTap={sending ? undefined : { scale: 0.98 }}
                        className="w-full rounded-full bg-navy px-7 py-3.5 text-sm font-semibold text-white shadow-soft transition-shadow hover:shadow-soft-lg disabled:opacity-60 sm:w-auto"
                      >
                        {sending ? t("formSending") : t("formSubmit")}
                      </motion.button>
                      <p className="text-xs text-ink-dim">{t("formNote")}</p>
                      <AnimatePresence>
                        {sent && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="text-xs font-semibold text-gold-dark"
                          >
                            ✓ {t("formSuccess")}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Reveal>

          <Reveal delay={0.15} className="overflow-hidden rounded-3xl shadow-soft">
            <iframe
              title={t("mapTitle")}
              src={`https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`}
              className="h-72 w-full border-0 sm:h-80"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Field({
  name,
  label,
  type = "text",
  required,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-dim">
        {label}
        {required && <span className="text-gold-dark"> *</span>}
      </label>
      <input
        name={name}
        type={type}
        required={required}
        className="w-full rounded-xl border border-border bg-bg px-4 py-2.5 text-sm text-ink outline-none focus:border-navy"
      />
    </div>
  );
}
