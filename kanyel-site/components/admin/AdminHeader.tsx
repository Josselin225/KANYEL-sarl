"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { ADMIN_NAV_ITEMS } from "@/lib/adminNav";
import { clearToken, getRole, getUsername } from "@/lib/adminApi";
import { useAdminTheme } from "./AdminThemeContext";
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
function IconSun() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5">
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 2.5v2M12 19.5v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2.5 12h2M19.5 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
function IconMoon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5">
      <path d="M20 14.5a8.5 8.5 0 1 1-9.5-11 7 7 0 0 0 9.5 11Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

export default function AdminHeader() {
  const pathname = usePathname();
  const locale = useLocale();
  const { dark, toggle } = useAdminTheme();
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
      <header className="sticky top-0 z-10 flex shrink-0 items-center justify-between border-b border-admin-border bg-admin-surface/95 px-8 py-4 backdrop-blur">
        <h1 className="font-display text-lg font-semibold text-admin-text">{current}</h1>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggle}
            aria-label={dark ? "Passer en mode clair" : "Passer en mode sombre"}
            className="flex h-9 w-9 items-center justify-center rounded-full text-admin-text-dim transition-colors hover:bg-admin-surface-hover hover:text-admin-text"
          >
            {dark ? <IconSun /> : <IconMoon />}
          </button>

          <Link
            href="/"
            className="rounded-full bg-admin-surface-hover px-4 py-2 text-xs font-semibold text-admin-text transition-colors hover:bg-admin-accent hover:text-admin-accent-text"
          >
            Voir le site
          </Link>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              className="flex items-center gap-2 rounded-full border border-admin-border py-1 pl-1 pr-2.5 transition-colors hover:bg-admin-surface-hover"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-admin-accent text-xs font-semibold text-admin-accent-text">
                {initial}
              </span>
              <span className="max-w-[8rem] truncate text-sm font-medium text-admin-text">{username ?? "Compte"}</span>
              <IconChevronDown />
            </button>

            {open && (
              <div className="absolute right-0 top-full z-20 mt-2 w-64 overflow-hidden rounded-2xl bg-admin-surface p-2 shadow-soft-lg">
                <div className="px-3 py-2">
                  <p className="truncate text-sm font-semibold text-admin-text">{username}</p>
                  <p className="text-xs text-admin-text-dim">
                    {role === "full" ? "Accès complet" : "Accueil (messages, candidatures, devis)"}
                  </p>
                </div>
                <div className="my-1 h-px bg-admin-border" />

                {role === "full" && (
                  <>
                    <Link
                      href="/admin/settings"
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-admin-text hover:bg-admin-surface-hover"
                    >
                      <IconSettings />
                      Paramètres du site
                    </Link>
                    <Link
                      href="/admin/users"
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-admin-text hover:bg-admin-surface-hover"
                    >
                      <IconUsers />
                      Gestion des utilisateurs
                    </Link>
                    <div className="my-1 h-px bg-admin-border" />
                  </>
                )}

                <button
                  onClick={() => {
                    setOpen(false);
                    setShowPasswordModal(true);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm text-admin-text hover:bg-admin-surface-hover"
                >
                  <IconKey />
                  Changer le mot de passe
                </button>

                <div className="my-1 h-px bg-admin-border" />

                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm text-red-600 hover:bg-red-500/10 admin-dark:text-red-400"
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
