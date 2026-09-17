"use client";

import { useEffect, useState } from "react";
import { adminApi, ApiError } from "@/lib/adminApi";
import { SETTINGS_FIELDS } from "@/lib/adminResources";
import AdminField from "@/components/admin/AdminField";

type Settings = Record<string, any>;

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await adminApi.getSingleton<Settings>("settings");
        setSettings(data);
        setForm(data);
      } catch (e) {
        setError(e instanceof ApiError ? e.message : "Erreur de chargement.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const fd = new FormData();
      for (const group of SETTINGS_FIELDS) {
        for (const f of group.fields) {
          const val = form[f.name];
          if (f.type === "image") {
            if (val instanceof File) fd.append(f.name, val);
          } else if (f.type === "number" && (val === null || val === undefined || val === "")) {
            // Omit empty optional coordinates — DRF rejects "" as an invalid number.
          } else {
            fd.append(f.name, String(val ?? ""));
          }
        }
      }
      const updated = await adminApi.updateSingleton<Settings>("settings", fd);
      setSettings(updated);
      setForm(updated);
      setSuccess(true);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-sm text-ink-dim">Chargement…</p>;
  if (!settings) return <p className="text-sm text-red-600">{error || "Paramètres introuvables."}</p>;

  return (
    <div className="mx-auto max-w-4xl">
      <h2 className="font-display text-xl font-semibold text-navy">Paramètres du site</h2>
      <p className="mt-1 text-sm text-ink-dim">
        Ces informations alimentent l&apos;ensemble du site (accueil, pied de page, contact, WhatsApp, réseaux sociaux).
      </p>

      <div className="mt-6 space-y-8">
        {SETTINGS_FIELDS.map((group) => (
          <div key={group.title} className="rounded-3xl bg-white p-6 shadow-soft">
            <h3 className="font-display text-base font-semibold text-navy">{group.title}</h3>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {group.fields.map((f) => (
                <div key={f.name} className={f.type === "textarea" || f.type === "image" ? "sm:col-span-2" : ""}>
                  <AdminField
                    field={f}
                    value={form[f.name]}
                    onChange={(v) => setForm((prev) => ({ ...prev, [f.name]: v }))}
                    currentImageUrl={f.type === "image" && typeof settings[f.name] === "string" ? settings[f.name] : null}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {success && <p className="mt-4 text-sm font-semibold text-gold-dark">✓ Paramètres enregistrés.</p>}

      <div className="sticky bottom-6 mt-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-full bg-navy px-7 py-3 text-sm font-semibold text-white shadow-soft-lg transition-transform hover:-translate-y-0.5 disabled:opacity-60"
        >
          {saving ? "Enregistrement…" : "Enregistrer les modifications"}
        </button>
      </div>
    </div>
  );
}
