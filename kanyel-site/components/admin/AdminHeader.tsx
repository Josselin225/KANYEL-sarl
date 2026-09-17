"use client";

import { useLocale } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { ADMIN_NAV_ITEMS } from "@/lib/adminNav";

export default function AdminHeader() {
  const pathname = usePathname();
  const locale = useLocale();

  const current =
    ADMIN_NAV_ITEMS.find((item) => (item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href)))
      ?.label ?? "Administration";

  return (
    <header className="sticky top-0 z-10 flex shrink-0 items-center justify-between border-b border-border bg-white/95 px-8 py-4 backdrop-blur">
      <h1 className="font-display text-lg font-semibold text-navy">{current}</h1>
      <a
        href={`/${locale}`}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full bg-navy-soft px-4 py-2 text-xs font-semibold text-navy transition-colors hover:bg-navy hover:text-white"
      >
        Voir le site ↗
      </a>
    </header>
  );
}
