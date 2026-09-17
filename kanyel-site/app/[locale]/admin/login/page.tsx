"use client";

import { FormEvent, useState } from "react";
import { useLocale } from "next-intl";
import { login, getToken } from "@/lib/adminApi";
import Logo from "@/components/Logo";

export default function AdminLoginPage() {
  const locale = useLocale();
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
    <div className="flex min-h-screen items-center justify-center bg-bg-alt px-5">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-soft-lg">
        <div className="flex justify-center">
          <Logo />
        </div>
        <h1 className="mt-6 text-center font-display text-xl font-semibold text-navy">
          Administration du site
        </h1>
        <p className="mt-1 text-center text-sm text-ink-dim">Connectez-vous pour continuer</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-dim">
              Identifiant<span className="text-gold-dark"> *</span>
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
              className="w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-sm text-ink outline-none focus:border-navy"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-dim">
              Mot de passe<span className="text-gold-dark"> *</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-sm text-ink outline-none focus:border-navy"
            />
          </div>

          <p className="text-xs text-ink-dim">
            <span className="text-gold-dark">*</span> Champ obligatoire
          </p>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white shadow-soft transition-transform hover:-translate-y-0.5 disabled:opacity-60"
          >
            {loading ? "Connexion…" : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}
