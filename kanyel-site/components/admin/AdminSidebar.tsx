"use client";

import { useLocale } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { clearToken, getUsername } from "@/lib/adminApi";
import { ADMIN_NAV_ITEMS } from "@/lib/adminNav";
import Logo from "../Logo";

function NavIcon({ name }: { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    dashboard: <path d="M4 13h6V4H4v9Zm0 7h6v-5H4v5Zm10 0h6V11h-6v9Zm0-16v5h6V4h-6Z" />,
    settings: (
      <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM19.4 13a7.4 7.4 0 0 0 .06-1 7.4 7.4 0 0 0-.06-1l2.1-1.6a.5.5 0 0 0 .12-.64l-2-3.4a.5.5 0 0 0-.6-.22l-2.5 1a7.6 7.6 0 0 0-1.7-1L14.4 2.5a.5.5 0 0 0-.5-.4h-4a.5.5 0 0 0-.5.4l-.4 2.6a7.6 7.6 0 0 0-1.7 1l-2.5-1a.5.5 0 0 0-.6.22l-2 3.4a.5.5 0 0 0 .12.64L4.6 11a7.4 7.4 0 0 0 0 2l-2.1 1.6a.5.5 0 0 0-.12.64l2 3.4c.13.22.4.3.6.22l2.5-1c.5.4 1.1.75 1.7 1l.4 2.6c.05.24.26.4.5.4h4c.24 0 .45-.16.5-.4l.4-2.6c.6-.25 1.2-.6 1.7-1l2.5 1c.2.08.47 0 .6-.22l2-3.4a.5.5 0 0 0-.12-.64L19.4 13Z" />
    ),
    layers: <path d="m12 2 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5m-18 5 9 5 9-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />,
    home: <path d="M4 11.5 12 4l8 7.5M6 10v10h5v-6h2v6h5V10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />,
    chart: <path d="M4 19V10m6 9V5m6 14v-7m6 7V9" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />,
    quote: <path d="M9.5 6.5c-2.8 1.2-4.5 3.4-4.5 6.2 0 2.1 1.4 3.6 3.2 3.6 1.7 0 3-1.3 3-3 0-1.6-1.1-2.8-2.6-3 .3-1.4 1.4-2.6 3-3.3L9.5 6.5Zm9 0c-2.8 1.2-4.5 3.4-4.5 6.2 0 2.1 1.4 3.6 3.2 3.6 1.7 0 3-1.3 3-3 0-1.6-1.1-2.8-2.6-3 .3-1.4 1.4-2.6 3-3.3l-2.1-.5Z" />,
    badge: <path d="M12 2 4 5v6c0 5 3.4 8.7 8 10 4.6-1.3 8-5 8-10V5l-8-3Zm0 5 2.3 4.6 5.1.7-3.7 3.6.9 5.1L12 18.5l-4.6 2.5.9-5.1-3.7-3.6 5.1-.7L12 7Z" />,
    handshake: <path d="m2 12 4-4 4 2 4-4 4 4 4-2M6 10l4 4 3-3 4 4M9 17l2 2 2-2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />,
    image: <path d="M4 5h16v14H4V5Zm2 12 4-5 3 3 3-4 4 6H6Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />,
    gallery: <path d="M3 7h13v11H3V7Zm0 0 3-3h9l3 3M8 12l2.5 3 2-2 3.5 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />,
    mail: <path d="M3 5h18v14H3V5Zm1 1.5L12 13l8-6.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />,
    briefcase: <path d="M4 8h16v11H4V8Zm4 0V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M4 13h16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />,
    user: <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9c0-3.9 3.1-7 7-7s7 3.1 7 7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />,
    star: <path d="M12 2.5 14.8 8.7 21.5 9.5 16.6 14 18 20.7 12 17.2 6 20.7 7.4 14 2.5 9.5 9.2 8.7 12 2.5Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />,
    news: <path d="M4 5h13v14H4V5Zm13 4h3v10H8v-2M7.5 8.5h6M7.5 11.5h6M7.5 14.5h4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />,
    help: <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM9.5 9a2.5 2.5 0 1 1 3.6 2.2c-.8.4-1.1 1-1.1 1.9v.3M12 16.8v.1" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />,
    invoice: <path d="M7 2.5h10l2 2v17l-3-2-2 2-2-2-2 2-2-2-3 2v-17l2-2Zm2 6h6M9 11.5h6M9 15h4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />,
  };
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4.5 w-4.5">
      {paths[name]}
    </svg>
  );
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const locale = useLocale();
  const username = getUsername();

  function handleLogout() {
    clearToken();
    window.location.href = `/${locale}/admin/login`;
  }

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-border bg-white">
      <div className="flex shrink-0 items-center gap-2 border-b border-border px-5 py-5">
        <Logo />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {ADMIN_NAV_ITEMS.map((item) => {
          const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          return (
            <a
              key={item.href}
              href={`/${locale}${item.href}`}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active ? "bg-navy text-white" : "text-ink-dim hover:bg-navy-soft hover:text-navy"
              }`}
            >
              <NavIcon name={item.icon} />
              {item.label}
            </a>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-border p-4">
        {username && <p className="mb-2 truncate text-xs text-ink-dim">Connecté : {username}</p>}
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-navy-soft px-3 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-navy hover:text-white"
        >
          Se déconnecter
        </button>
        <a
          href={`/${locale}`}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs text-ink-dim hover:text-navy"
        >
          ← Retour au site
        </a>
      </div>
    </aside>
  );
}
