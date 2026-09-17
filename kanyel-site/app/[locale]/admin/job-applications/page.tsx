"use client";

import { useEffect, useState } from "react";
import { adminApi, ApiError } from "@/lib/adminApi";

interface JobApplication {
  id: number;
  job: number | null;
  job_title: string | null;
  full_name: string;
  email: string;
  phone: string;
  message: string;
  cv: string;
  cover_letter: string | null;
  created_at: string;
  is_read: boolean;
}

export default function AdminJobApplicationsPage() {
  const [items, setItems] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<JobApplication | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.list<JobApplication>("job-applications");
      setItems(data);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Erreur de chargement.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function openItem(item: JobApplication) {
    setSelected(item);
    if (!item.is_read) {
      try {
        const updated = await adminApi.update<JobApplication>("job-applications", item.id, { is_read: true });
        setItems((prev) => prev.map((it) => (it.id === item.id ? updated : it)));
        setSelected(updated);
      } catch {
        // Non-blocking.
      }
    }
  }

  async function handleDelete(item: JobApplication) {
    if (!confirm("Supprimer définitivement cette candidature ?")) return;
    try {
      await adminApi.remove("job-applications", item.id);
      setItems((prev) => prev.filter((it) => it.id !== item.id));
      setSelected(null);
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "Erreur lors de la suppression.");
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <h2 className="font-display text-xl font-semibold text-navy">Candidatures</h2>
        {loading && <p className="mt-4 text-sm text-ink-dim">Chargement…</p>}
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <ul className="mt-4 space-y-2">
          {items.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => openItem(item)}
                className={`flex w-full items-start justify-between gap-3 rounded-2xl border p-3 text-left transition-colors ${
                  selected?.id === item.id ? "border-navy bg-navy-soft" : "border-border bg-white hover:border-navy/40"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-navy">{item.full_name}</p>
                  <p className="truncate text-xs text-ink-dim">
                    {item.job_title || "Candidature spontanée"}
                  </p>
                </div>
                {!item.is_read && (
                  <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-gold-dark" />
                )}
              </button>
            </li>
          ))}
          {!loading && items.length === 0 && (
            <p className="text-sm text-ink-dim">Aucune candidature reçue pour le moment.</p>
          )}
        </ul>
      </div>

      <div className="lg:col-span-3">
        {selected ? (
          <div className="rounded-3xl bg-white p-6 shadow-soft">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display text-lg font-semibold text-navy">{selected.full_name}</h3>
                <p className="text-sm text-ink-dim">{selected.job_title || "Candidature spontanée"}</p>
              </div>
              <button
                onClick={() => handleDelete(selected)}
                className="text-xs font-semibold text-red-600 hover:underline"
              >
                Supprimer
              </button>
            </div>

            <dl className="mt-5 space-y-3 text-sm">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-ink-dim">E-mail</dt>
                <dd>
                  <a href={`mailto:${selected.email}`} className="text-navy hover:underline">
                    {selected.email}
                  </a>
                </dd>
              </div>
              {selected.phone && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-ink-dim">Téléphone</dt>
                  <dd>
                    <a href={`tel:${selected.phone}`} className="text-navy hover:underline">
                      {selected.phone}
                    </a>
                  </dd>
                </div>
              )}
              {selected.message && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-ink-dim">Message</dt>
                  <dd className="whitespace-pre-line text-ink-dim">{selected.message}</dd>
                </div>
              )}
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-ink-dim">Reçue le</dt>
                <dd className="text-ink-dim">{new Date(selected.created_at).toLocaleString("fr-FR")}</dd>
              </div>
            </dl>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={selected.cv}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition-transform hover:-translate-y-0.5"
              >
                Télécharger le CV
              </a>
              {selected.cover_letter && (
                <a
                  href={selected.cover_letter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-navy-soft px-5 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-navy hover:text-white"
                >
                  Lettre de motivation
                </a>
              )}
            </div>
          </div>
        ) : (
          <div className="flex h-full min-h-[240px] items-center justify-center rounded-3xl border border-dashed border-border text-sm text-ink-dim">
            Sélectionnez une candidature pour voir le détail.
          </div>
        )}
      </div>
    </div>
  );
}
