"use client";

export default function ShareButtons({
  url,
  title,
  label,
  whatsappLabel,
  facebookLabel,
}: {
  url: string;
  title: string;
  label: string;
  whatsappLabel: string;
  facebookLabel: string;
}) {
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(`${title} — ${url}`)}`;
  const facebookHref = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-semibold uppercase tracking-wide text-ink-dim">{label}</span>
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={whatsappLabel}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-[#25D366]/10 text-[#25D366] transition-transform hover:-translate-y-0.5 hover:bg-[#25D366]/20"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4.5 w-4.5">
          <path d="M12.04 2c-5.5 0-9.96 4.46-9.96 9.96 0 1.76.46 3.4 1.26 4.83L2 22l5.36-1.28a9.9 9.9 0 0 0 4.68 1.18h.01c5.5 0 9.96-4.46 9.96-9.96S17.54 2 12.04 2Zm5.8 14.06c-.24.68-1.4 1.3-1.93 1.36-.5.06-1.14.09-1.83-.11-.42-.13-.96-.3-1.65-.6-2.9-1.25-4.8-4.16-4.94-4.36-.14-.2-1.18-1.57-1.18-3s.75-2.13 1.02-2.42c.26-.29.57-.36.76-.36h.55c.18 0 .42-.07.65.5.24.58.83 2 .9 2.14.07.14.12.31.02.5-.1.2-.15.32-.29.5-.15.18-.31.4-.44.53-.15.15-.3.31-.13.6.17.29.75 1.24 1.62 2 1.11.99 2.05 1.3 2.34 1.44.29.15.46.13.63-.07.17-.2.72-.84.92-1.13.2-.29.4-.24.65-.14.26.09 1.66.78 1.94.92.29.15.48.22.55.34.07.13.07.73-.17 1.4Z" />
        </svg>
      </a>
      <a
        href={facebookHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={facebookLabel}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1877F2]/10 text-[#1877F2] transition-transform hover:-translate-y-0.5 hover:bg-[#1877F2]/20"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4.5 w-4.5">
          <path d="M13.5 21v-7.5h2.5l.4-3H13.5V8.4c0-.87.24-1.46 1.5-1.46h1.6V4.28C16.32 4.2 15.4 4.1 14.3 4.1c-2.28 0-3.84 1.4-3.84 3.96v2.44H8v3h2.46V21h3.04Z" />
        </svg>
      </a>
    </div>
  );
}
