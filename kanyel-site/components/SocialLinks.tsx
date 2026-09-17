import type { ApiSiteSettings } from "@/lib/api";

function IconFacebook() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M13.5 21v-7.6h2.6l.4-3h-3v-1.9c0-.9.2-1.5 1.5-1.5h1.6V4.3c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.2H8v3h2.5V21h3Z" />
    </svg>
  );
}
function IconInstagram() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" />
    </svg>
  );
}
function IconLinkedIn() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
      <rect x="3.5" y="3.5" width="17" height="17" rx="2.5" fillOpacity="0" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7.5 10v6.5M7.5 7.6v.02M11 10v6.5m0-4c0-1.4.9-2.5 2.4-2.5 1.6 0 2.1 1 2.1 2.6v3.9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />
    </svg>
  );
}
function IconX() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M4 4l7 8.4L4.3 20H6.6l5.7-6.2L16.9 20H20l-7.4-8.9L19.7 4h-2.3l-5.2 5.7L8 4H4Z" />
    </svg>
  );
}
function IconTikTok() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M14.5 3.5c.4 2 1.9 3.5 4 3.7v2.6c-1.5 0-2.9-.5-4-1.3v6c0 3-2.4 5-5.1 5-2.6 0-5-2-5-5s2.4-5 5-5c.3 0 .6 0 .9.1v2.7a2.5 2.5 0 1 0 1.8 2.4V3.5h2.4Z" />
    </svg>
  );
}
function IconYouTube() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
      <rect x="3" y="6" width="18" height="12" rx="3.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10.5 9.5v5l4.3-2.5-4.3-2.5Z" fill="currentColor" />
    </svg>
  );
}

export default function SocialLinks({
  settings,
  className = "",
}: {
  settings: ApiSiteSettings | null;
  className?: string;
}) {
  if (!settings) return null;

  const links = [
    { url: settings.facebook_url, label: "Facebook", Icon: IconFacebook },
    { url: settings.instagram_url, label: "Instagram", Icon: IconInstagram },
    { url: settings.linkedin_url, label: "LinkedIn", Icon: IconLinkedIn },
    { url: settings.x_url, label: "X", Icon: IconX },
    { url: settings.tiktok_url, label: "TikTok", Icon: IconTikTok },
    { url: settings.youtube_url, label: "YouTube", Icon: IconYouTube },
  ].filter((l) => l.url);

  if (links.length === 0) return null;

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {links.map(({ url, label, Icon }) => (
        <a
          key={label}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/75 transition-colors hover:bg-white/15 hover:text-gold-light"
        >
          <Icon />
        </a>
      ))}
    </div>
  );
}
