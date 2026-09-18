"use client";

import { useEffect, useState } from "react";
import { adminApi, ApiError, getToken } from "@/lib/adminApi";

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

  async function downloadFile(url: string, filename: string) {
    try {
      const res = await fetch(url, { headers: { Authorization: `Token ${getToken()}` } });
      if (!res.ok) throw new Error("Téléchargement impossible.");
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(blobUrl);
    } catch {
      alert("Impossible de télécharger ce fichier.");
    }
  }

  function exportCsv() {
    const header = ["Nom", "E-mail", "Téléphone", "Offre", "Message", "Reçue le"];
    const rows = items.map((it) => [
      it.full_name,
      it.email,
      it.phone,
      it.job_title || "Candidature spontanée",
      it.message.replace(/\n/g, " "),
      new Date(it.created_at).toLocaleString("fr-FR"),
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `candidatures-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-admin-text">Candidatures</h2>
          {items.length > 0 && (
            <button
              onClick={exportCsv}
              className="rounded-full bg-admin-surface-hover px-3.5 py-1.5 text-xs font-semibold text-admin-text transition-colors hover:bg-admin-accent hover:text-admin-accent-text"
            >
              Exporter CSV
            </button>
          )}
        </div>
        {loading && <p className="mt-4 text-sm text-admin-text-dim">Chargement…</p>}
        {error && <p className="mt-4 text-sm text-red-600 admin-dark:text-red-400">{error}</p>}

        <ul className="mt-4 space-y-2">
          {items.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => openItem(item)}
                className={`flex w-full items-start justify-between gap-3 rounded-2xl border p-3 text-left transition-colors ${
                  selected?.id === item.id ? "border-admin-accent bg-admin-surface-hover" : "border-admin-border bg-admin-surface hover:border-admin-accent/40"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-admin-text">{item.full_name}</p>
                  <p className="truncate text-xs text-admin-text-dim">
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
            <p className="text-sm text-admin-text-dim">Aucune candidature reçue pour le moment.</p>
          )}
        </ul>
      </div>

      <div className="lg:col-span-3">
        {selected ? (
          <div className="rounded-3xl bg-admin-surface p-6 shadow-soft">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display text-lg font-semibold text-admin-text">{selected.full_name}</h3>
                <p className="text-sm text-admin-text-dim">{selected.job_title || "Candidature spontanée"}</p>
              </div>
              <button
                onClick={() => handleDelete(selected)}
                className="text-xs font-semibold text-red-600 admin-dark:text-red-400 hover:underline"
              >
                Supprimer
              </button>
            </div>

            <dl className="mt-5 space-y-3 text-sm">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-admin-text-dim">E-mail</dt>
                <dd>
                  <a href={`mailto:${selected.email}`} className="text-admin-text hover:underline">
                    {selected.email}
                  </a>
                </dd>
              </div>
              {selected.phone && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-admin-text-dim">Téléphone</dt>
                  <dd>
                    <a href={`tel:${selected.phone}`} className="text-admin-text hover:underline">
                      {selected.phone}
                    </a>
                  </dd>
                </div>
              )}
              {selected.message && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-admin-text-dim">Message</dt>
                  <dd className="whitespace-pre-line text-admin-text-dim">{selected.message}</dd>
                </div>
              )}
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-admin-text-dim">Reçue le</dt>
                <dd className="text-admin-text-dim">{new Date(selected.created_at).toLocaleString("fr-FR")}</dd>
              </div>
            </dl>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => downloadFile(selected.cv, `CV-${selected.full_name}.pdf`)}
                className="rounded-full bg-admin-accent px-5 py-2.5 text-sm font-semibold text-admin-accent-text shadow-soft transition-transform hover:-translate-y-0.5"
              >
                Télécharger le CV
              </button>
              {selected.cover_letter && (
                <button
                  onClick={() => downloadFile(selected.cover_letter!, `Lettre-${selected.full_name}.pdf`)}
                  className="rounded-full bg-admin-surface-hover px-5 py-2.5 text-sm font-semibold text-admin-text transition-colors hover:bg-admin-accent hover:text-admin-accent-text"
                >
                  Lettre de motivation
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex h-full min-h-[240px] items-center justify-center rounded-3xl border border-dashed border-admin-border text-sm text-admin-text-dim">
            Sélectionnez une candidature pour voir le détail.
          </div>
        )}
      </div>
    </div>
  );
}
