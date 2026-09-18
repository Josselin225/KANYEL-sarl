"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { ADMIN_NAV_ITEMS } from "@/lib/adminNav";
import { clearToken, getRole, getUsername } from "@/lib/adminApi";
import ChangePasswordModal from "./ChangePasswordModal";

function IconChevronDown() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
      <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconSettings() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
      <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M19.4 13a7.4 7.4 0 0 0 0-2l2.1-1.6-2-3.4-2.5 1a7.6 7.6 0 0 0-1.7-1L14.9 3h-4l-.4 2.6a7.6 7.6 0 0 0-1.7 1l-2.5-1-2 3.4L6.4 11a7.4 7.4 0 0 0 0 2l-2.1 1.6 2 3.4 2.5-1c.5.4 1.1.75 1.7 1l.4 2.6h4l.4-2.6c.6-.25 1.2-.6 1.7-1l2.5 1 2-3.4L19.4 13Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function IconUsers() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 8.5a2.7 2.7 0 1 1 0-5.4M15 14.2c2.5.4 4.5 2.6 4.5 5.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function IconKey() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
      <circle cx="8" cy="15" r="4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M11 12 19 4M16 6l2.5 2.5M13.5 8.5 16 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconLogout() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function AdminHeader() {
  const pathname = usePathname();
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const username = getUsername();
  const role = getRole();

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const current =
    ADMIN_NAV_ITEMS.find((item) => (item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href)))
      ?.label ?? "Administration";

  function handleLogout() {
    clearToken();
    window.location.href = `/${locale}/admin/login`;
  }

  const initial = (username || "?").charAt(0).toUpperCase();

  return (
    <>
      <header className="sticky top-0 z-10 flex shrink-0 items-center justify-between border-b border-border bg-white/95 px-8 py-4 backdrop-blur">
        <h1 className="font-display text-lg font-semibold text-navy">{current}</h1>

        <div className="flex items-center gap-3">
          <a
            href={`/${locale}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-navy-soft px-4 py-2 text-xs font-semibold text-navy transition-colors hover:bg-navy hover:text-white"
          >
            Voir le site ↗
          </a>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              className="flex items-center gap-2 rounded-full border border-border py-1 pl-1 pr-2.5 transition-colors hover:bg-navy-soft"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-navy text-xs font-semibold text-white">
                {initial}
              </span>
              <span className="max-w-[8rem] truncate text-sm font-medium text-navy">{username ?? "Compte"}</span>
              <IconChevronDown />
            </button>

            {open && (
              <div className="absolute right-0 top-full z-20 mt-2 w-64 overflow-hidden rounded-2xl bg-white p-2 shadow-soft-lg">
                <div className="px-3 py-2">
                  <p className="truncate text-sm font-semibold text-navy">{username}</p>
                  <p className="text-xs text-ink-dim">
                    {role === "full" ? "Accès complet" : "Accueil (messages, candidatures, devis)"}
                  </p>
                </div>
                <div className="my-1 h-px bg-border" />

                {role === "full" && (
                  <>
                    <a
                      href={`/${locale}/admin/settings`}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-ink hover:bg-navy-soft"
                    >
                      <IconSettings />
                      Paramètres du site
                    </a>
                    <a
                      href={`/${locale}/admin/users`}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-ink hover:bg-navy-soft"
                    >
                      <IconUsers />
                      Gestion des utilisateurs
                    </a>
                    <div className="my-1 h-px bg-border" />
                  </>
                )}

                <button
                  onClick={() => {
                    setOpen(false);
                    setShowPasswordModal(true);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm text-ink hover:bg-navy-soft"
                >
                  <IconKey />
                  Changer le mot de passe
                </button>

                <div className="my-1 h-px bg-border" />

                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  <IconLogout />
                  Se déconnecter
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {showPasswordModal && <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />}
    </>
  );
}
