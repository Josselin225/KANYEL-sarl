"use client";

import { useEffect, useState } from "react";
import { adminApi, ApiError } from "@/lib/adminApi";

interface Subscriber {
  id: number;
  email: string;
  created_at: string;
  is_active: boolean;
}

export default function AdminNewsletterSubscribersPage() {
  const [items, setItems] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.list<Subscriber>("newsletter-subscribers");
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

  async function toggleActive(item: Subscriber) {
    try {
      const updated = await adminApi.update<Subscriber>("newsletter-subscribers", item.id, {
        is_active: !item.is_active,
      });
      setItems((prev) => prev.map((it) => (it.id === item.id ? updated : it)));
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "Erreur lors de la mise à jour.");
    }
  }

  async function handleDelete(item: Subscriber) {
    if (!confirm(`Supprimer définitivement l'abonné ${item.email} ?`)) return;
    try {
      await adminApi.remove("newsletter-subscribers", item.id);
      setItems((prev) => prev.filter((it) => it.id !== item.id));
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "Erreur lors de la suppression.");
    }
  }

  function exportCsv() {
    const header = ["E-mail", "Inscrit le", "Actif"];
    const rows = items.map((it) => [it.email, new Date(it.created_at).toLocaleString("fr-FR"), it.is_active ? "Oui" : "Non"]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `abonnes-newsletter-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const activeCount = items.filter((it) => it.is_active).length;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold text-admin-text">Abonnés newsletter</h2>
          <p className="mt-1 text-sm text-admin-text-dim">
            {activeCount} actif{activeCount > 1 ? "s" : ""} sur {items.length}
          </p>
        </div>
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
          <li
            key={item.id}
            className="flex items-center justify-between gap-3 rounded-2xl border border-admin-border bg-admin-surface p-3.5"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-admin-text">{item.email}</p>
              <p className="text-xs text-admin-text-dim">{new Date(item.created_at).toLocaleDateString("fr-FR")}</p>
            </div>
            <label className="flex shrink-0 items-center gap-2 text-xs font-semibold text-admin-text-dim">
              <input
                type="checkbox"
                checked={item.is_active}
                onChange={() => toggleActive(item)}
                className="h-4 w-4 accent-admin-accent"
              />
              Actif
            </label>
            <button
              onClick={() => handleDelete(item)}
              className="shrink-0 text-xs font-semibold text-red-600 hover:underline admin-dark:text-red-400"
            >
              Supprimer
            </button>
          </li>
        ))}
        {!loading && items.length === 0 && (
          <p className="text-sm text-admin-text-dim">Aucun abonné pour le moment.</p>
        )}
      </ul>
    </div>
  );
}
