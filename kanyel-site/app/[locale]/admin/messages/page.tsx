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

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <h2 className="font-display text-xl font-semibold text-navy">Messages</h2>
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
                  <p className="truncate text-sm font-semibold text-navy">{item.name}</p>
                  <p className="truncate text-xs text-ink-dim">{item.subject || "Sans objet"}</p>
                </div>
                {!item.is_read && <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-gold-dark" />}
              </button>
            </li>
          ))}
          {!loading && items.length === 0 && (
            <p className="text-sm text-ink-dim">Aucun message reçu pour le moment.</p>
          )}
        </ul>
      </div>

      <div className="lg:col-span-3">
        {selected ? (
          <div className="rounded-3xl bg-white p-6 shadow-soft">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display text-lg font-semibold text-navy">{selected.name}</h3>
                <p className="text-sm text-ink-dim">{selected.subject || "Sans objet"}</p>
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
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-ink-dim">Message</dt>
                <dd className="whitespace-pre-line text-ink-dim">{selected.message}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-ink-dim">Reçu le</dt>
                <dd className="text-ink-dim">{new Date(selected.created_at).toLocaleString("fr-FR")}</dd>
              </div>
            </dl>
          </div>
        ) : (
          <div className="flex h-full min-h-[240px] items-center justify-center rounded-3xl border border-dashed border-border text-sm text-ink-dim">
            Sélectionnez un message pour voir le détail.
          </div>
        )}
      </div>
    </div>
  );
}
