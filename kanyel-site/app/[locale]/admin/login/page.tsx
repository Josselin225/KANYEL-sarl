"use client";

import { FormEvent, useState } from "react";
import { useLocale } from "next-intl";
import { login, getToken } from "@/lib/adminApi";
import Logo from "@/components/Logo";
import { useAdminTheme } from "@/components/admin/AdminThemeContext";

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

export default function AdminLoginPage() {
  const locale = useLocale();
  const { dark, toggle } = useAdminTheme();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (typeof window !== "undefined" && getToken()) {
    window.location.href = `/${locale}/admin`;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await login(username, password);
    setLoading(false);
    if (result.ok) {
      window.location.href = `/${locale}/admin`;
    } else {
      setError(result.error);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-admin-bg px-5">
      <button
        type="button"
        onClick={toggle}
        aria-label={dark ? "Passer en mode clair" : "Passer en mode sombre"}
        className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full text-admin-text-dim transition-colors hover:bg-admin-surface-hover hover:text-admin-text"
      >
        {dark ? <IconSun /> : <IconMoon />}
      </button>

      <div className="w-full max-w-sm rounded-3xl bg-admin-surface p-8 shadow-soft-lg">
        <div className="flex justify-center">
          <Logo />
        </div>
        <h1 className="mt-6 text-center font-display text-xl font-semibold text-admin-text">
          Administration du site
        </h1>
        <p className="mt-1 text-center text-sm text-admin-text-dim">Connectez-vous pour continuer</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-admin-text-dim">
              Identifiant<span className="text-gold-dark"> *</span>
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
              className="w-full rounded-xl border border-admin-border bg-admin-bg px-3.5 py-2.5 text-sm text-admin-text outline-none focus:border-admin-accent"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-admin-text-dim">
              Mot de passe<span className="text-gold-dark"> *</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-admin-border bg-admin-bg px-3.5 py-2.5 text-sm text-admin-text outline-none focus:border-admin-accent"
            />
          </div>

          <p className="text-xs text-admin-text-dim">
            <span className="text-gold-dark">*</span> Champ obligatoire
          </p>

          {error && <p className="text-sm text-red-600 admin-dark:text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-admin-accent px-6 py-3 text-sm font-semibold text-admin-accent-text shadow-soft transition-transform hover:-translate-y-0.5 disabled:opacity-60"
          >
            {loading ? "Connexion…" : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}
