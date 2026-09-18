"use client";

import { useEffect, useState } from "react";
import { adminApi, ApiError } from "@/lib/adminApi";

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

export default function AdminMessagesPage() {
  const [items, setItems] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<ContactMessage | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.list<ContactMessage>("messages");
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

  async function openItem(item: ContactMessage) {
    setSelected(item);
    if (!item.is_read) {
      try {
        const updated = await adminApi.update<ContactMessage>("messages", item.id, { is_read: true });
        setItems((prev) => prev.map((it) => (it.id === item.id ? updated : it)));
        setSelected(updated);
      } catch {
        // Non-blocking.
      }
    }
  }

  async function handleDelete(item: ContactMessage) {
    if (!confirm("Supprimer définitivement ce message ?")) return;
    try {
      await adminApi.remove("messages", item.id);
      setItems((prev) => prev.filter((it) => it.id !== item.id));
      setSelected(null);
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "Erreur lors de la suppression.");
    }
  }

  function exportCsv() {
    const header = ["Nom", "E-mail", "Téléphone", "Sujet", "Message", "Reçu le"];
    const rows = items.map((it) => [
      it.name,
      it.email,
      it.phone,
      it.subject || "Sans objet",
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
    a.download = `messages-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-admin-text">Messages</h2>
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
                  <p className="truncate text-sm font-semibold text-admin-text">{item.name}</p>
                  <p className="truncate text-xs text-admin-text-dim">{item.subject || "Sans objet"}</p>
                </div>
                {!item.is_read && <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-gold-dark" />}
              </button>
            </li>
          ))}
          {!loading && items.length === 0 && (
            <p className="text-sm text-admin-text-dim">Aucun message reçu pour le moment.</p>
          )}
        </ul>
      </div>

      <div className="lg:col-span-3">
        {selected ? (
          <div className="rounded-3xl bg-admin-surface p-6 shadow-soft">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display text-lg font-semibold text-admin-text">{selected.name}</h3>
                <p className="text-sm text-admin-text-dim">{selected.subject || "Sans objet"}</p>
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
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-admin-text-dim">Message</dt>
                <dd className="whitespace-pre-line text-admin-text-dim">{selected.message}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-admin-text-dim">Reçu le</dt>
                <dd className="text-admin-text-dim">{new Date(selected.created_at).toLocaleString("fr-FR")}</dd>
              </div>
            </dl>
          </div>
        ) : (
          <div className="flex h-full min-h-[240px] items-center justify-center rounded-3xl border border-dashed border-admin-border text-sm text-admin-text-dim">
            Sélectionnez un message pour voir le détail.
          </div>
        )}
      </div>
    </div>
  );
}
