"use client";

import { useEffect, useState } from "react";
import { adminApi, ApiError } from "@/lib/adminApi";

const BUDGET_LABELS: Record<string, string> = {
  lt_5m: "Moins de 5 000 000 FCFA",
  "5m_20m": "5 000 000 – 20 000 000 FCFA",
  "20m_100m": "20 000 000 – 100 000 000 FCFA",
  gt_100m: "Plus de 100 000 000 FCFA",
  unknown: "À définir",
};

const TIMELINE_LABELS: Record<string, string> = {
  urgent: "Urgent (moins d'1 mois)",
  "1_3_months": "1 à 3 mois",
  "3_6_months": "3 à 6 mois",
  "6_plus_months": "Plus de 6 mois",
  flexible: "Flexible",
};

interface QuoteRequest {
  id: number;
  department: string | null;
  department_title: string | null;
  full_name: string;
  email: string;
  phone: string;
  budget: string;
  timeline: string;
  description: string;
  created_at: string;
  is_read: boolean;
}

export default function AdminQuoteRequestsPage() {
  const [items, setItems] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<QuoteRequest | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.list<QuoteRequest>("quote-requests");
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

  async function openItem(item: QuoteRequest) {
    setSelected(item);
    if (!item.is_read) {
      try {
        const updated = await adminApi.update<QuoteRequest>("quote-requests", item.id, { is_read: true });
        setItems((prev) => prev.map((it) => (it.id === item.id ? updated : it)));
        setSelected(updated);
      } catch {
        // Non-blocking.
      }
    }
  }

  async function handleDelete(item: QuoteRequest) {
    if (!confirm("Supprimer définitivement cette demande de devis ?")) return;
    try {
      await adminApi.remove("quote-requests", item.id);
      setItems((prev) => prev.filter((it) => it.id !== item.id));
      setSelected(null);
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "Erreur lors de la suppression.");
    }
  }

  function exportCsv() {
    const header = ["Nom", "E-mail", "Téléphone", "Activité", "Budget", "Délai", "Description", "Reçue le"];
    const rows = items.map((it) => [
      it.full_name,
      it.email,
      it.phone,
      it.department_title || "Devis général",
      BUDGET_LABELS[it.budget] || it.budget,
      TIMELINE_LABELS[it.timeline] || it.timeline,
      it.description.replace(/\n/g, " "),
      new Date(it.created_at).toLocaleString("fr-FR"),
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `demandes-devis-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-navy">Demandes de devis</h2>
          {items.length > 0 && (
            <button
              onClick={exportCsv}
              className="rounded-full bg-navy-soft px-3.5 py-1.5 text-xs font-semibold text-navy transition-colors hover:bg-navy hover:text-white"
            >
              Exporter CSV
            </button>
          )}
        </div>
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
                  <p className="truncate text-xs text-ink-dim">{item.department_title || "Devis général"}</p>
                </div>
                {!item.is_read && <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-gold-dark" />}
              </button>
            </li>
          ))}
          {!loading && items.length === 0 && (
            <p className="text-sm text-ink-dim">Aucune demande de devis reçue pour le moment.</p>
          )}
        </ul>
      </div>

      <div className="lg:col-span-3">
        {selected ? (
          <div className="rounded-3xl bg-white p-6 shadow-soft">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display text-lg font-semibold text-navy">{selected.full_name}</h3>
                <p className="text-sm text-ink-dim">{selected.department_title || "Devis général"}</p>
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
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-ink-dim">Téléphone</dt>
                <dd>
                  <a href={`tel:${selected.phone}`} className="text-navy hover:underline">
                    {selected.phone}
                  </a>
                </dd>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-ink-dim">Budget</dt>
                  <dd className="text-ink-dim">{BUDGET_LABELS[selected.budget] || selected.budget}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-ink-dim">Délai souhaité</dt>
                  <dd className="text-ink-dim">{TIMELINE_LABELS[selected.timeline] || selected.timeline}</dd>
                </div>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-ink-dim">Description du projet</dt>
                <dd className="whitespace-pre-line text-ink-dim">{selected.description}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-ink-dim">Reçue le</dt>
                <dd className="text-ink-dim">{new Date(selected.created_at).toLocaleString("fr-FR")}</dd>
              </div>
            </dl>
          </div>
        ) : (
          <div className="flex h-full min-h-[240px] items-center justify-center rounded-3xl border border-dashed border-border text-sm text-ink-dim">
            Sélectionnez une demande pour voir le détail.
          </div>
        )}
      </div>
    </div>
  );
}
