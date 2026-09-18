"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { buildWhatsAppUrl, type ApiSiteSettings } from "@/lib/api";

function IconWhatsApp() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4.5 w-4.5">
      <path d="M17.5 14.4c-.3-.1-1.7-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.4-1.5-.9-.8-1.5-1.8-1.6-2.1-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.1.2-.3.3-.4.1-.2 0-.4 0-.5-.1-.1-.7-1.6-.9-2.2-.2-.5-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1.1 2.8 1.2 3c.1.2 2.2 3.4 5.3 4.7.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.6.2-1.2.2-1.3-.1-.2-.3-.2-.6-.4Z" />
      <path d="M12.03 2C6.5 2 2 6.5 2 12c0 1.8.5 3.5 1.3 5L2 22l5.2-1.4c1.4.8 3.1 1.2 4.8 1.2 5.5 0 10-4.5 10-10S17.6 2 12.03 2Zm0 18.3c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-3.1.8.8-3-.2-.3c-.9-1.4-1.3-3-1.3-4.6 0-4.6 3.8-8.4 8.4-8.4s8.4 3.8 8.4 8.4-3.7 8.5-8.3 8.5Z" />
    </svg>
  );
}
function IconFacebook() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4.5 w-4.5">
      <path d="M13.5 21v-7.6h2.6l.4-3h-3v-1.9c0-.9.2-1.5 1.5-1.5h1.6V4.3c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.2H8v3h2.5V21h3Z" />
    </svg>
  );
}
function IconInstagram() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5">
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" />
    </svg>
  );
}
function IconLinkedIn() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5">
      <rect x="3.5" y="3.5" width="17" height="17" rx="2.5" fillOpacity="0" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M7.5 10v6.5M7.5 7.6v.02M11 10v6.5m0-4c0-1.4.9-2.5 2.4-2.5 1.6 0 2.1 1 2.1 2.6v3.9"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
function IconX() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4.5 w-4.5">
      <path d="M4 4l7 8.4L4.3 20H6.6l5.7-6.2L16.9 20H20l-7.4-8.9L19.7 4h-2.3l-5.2 5.7L8 4H4Z" />
    </svg>
  );
}
function IconTikTok() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4.5 w-4.5">
      <path d="M14.5 3.5c.4 2 1.9 3.5 4 3.7v2.6c-1.5 0-2.9-.5-4-1.3v6c0 3-2.4 5-5.1 5-2.6 0-5-2-5-5s2.4-5 5-5c.3 0 .6 0 .9.1v2.7a2.5 2.5 0 1 0 1.8 2.4V3.5h2.4Z" />
    </svg>
  );
}
function IconYouTube() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5">
      <rect x="3" y="6" width="18" height="12" rx="3.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10.5 9.5v5l4.3-2.5-4.3-2.5Z" fill="currentColor" />
    </svg>
  );
}
function IconPlus() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function FloatingSocials({ settings }: { settings: ApiSiteSettings | null }) {
  const pathname = usePathname();
  const t = useTranslations("footer");
  const [open, setOpen] = useState(false);
  if (pathname.startsWith("/admin")) return null;

  const phone = settings?.whatsapp_number;
  const items = [
    { url: settings?.facebook_url, label: "Facebook", Icon: IconFacebook },
    { url: settings?.instagram_url, label: "Instagram", Icon: IconInstagram },
    { url: settings?.linkedin_url, label: "LinkedIn", Icon: IconLinkedIn },
    { url: settings?.x_url, label: "X", Icon: IconX },
    { url: settings?.tiktok_url, label: "TikTok", Icon: IconTikTok },
    { url: settings?.youtube_url, label: "YouTube", Icon: IconYouTube },
    {
      url: phone ? buildWhatsAppUrl(phone, t("whatsappMessage")) : undefined,
      label: "WhatsApp",
      Icon: IconWhatsApp,
    },
  ].filter((s): s is { url: string; label: string; Icon: typeof IconFacebook } => Boolean(s.url));

  if (items.length === 0) return null;

  return (
    <div
      className="fixed bottom-6 left-6 z-40 flex flex-col items-center gap-3"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <AnimatePresence>
        {open &&
          items.map((s, i) => (
            <motion.div
              key={s.label}
              className="group relative"
              initial={{ opacity: 0, y: 12, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.9 }}
              transition={{ duration: 0.2, delay: 0.04 * (items.length - i) }}
            >
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label === "WhatsApp" ? t("whatsappCta") : s.label}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-navy text-white shadow-soft-lg transition-transform hover:scale-110 hover:bg-gold-dark"
              >
                <s.Icon />
              </a>
              <span className="pointer-events-none absolute left-full top-1/2 ml-3 -translate-y-1/2 whitespace-nowrap rounded-full bg-navy-deep px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-soft transition-opacity duration-150 group-hover:opacity-100">
                {s.label}
              </span>
            </motion.div>
          ))}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Nos réseaux"
        aria-expanded={open}
        animate={{ rotate: open ? 45 : 0 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.25 }}
        className="flex h-11 w-11 items-center justify-center rounded-full bg-navy text-white shadow-soft-lg transition-colors hover:bg-gold-dark"
      >
        <IconPlus />
      </motion.button>
    </div>
  );
}
