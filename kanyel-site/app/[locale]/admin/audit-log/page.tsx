"use client";

import { useEffect, useState } from "react";
import { adminApi, ApiError } from "@/lib/adminApi";

interface AuditLogEntry {
  id: number;
  username: string;
  action: "create" | "update" | "delete";
  resource: string;
  object_repr: string;
  created_at: string;
}

const ACTION_LABELS: Record<AuditLogEntry["action"], string> = {
  create: "Création",
  update: "Modification",
  delete: "Suppression",
};

const ACTION_STYLES: Record<AuditLogEntry["action"], string> = {
  create: "bg-green-100 text-green-700 admin-dark:bg-green-500/15 admin-dark:text-green-300",
  update: "bg-gold-soft text-gold-dark admin-dark:bg-gold-dark/15 admin-dark:text-gold-light",
  delete: "bg-red-100 text-red-700 admin-dark:bg-red-500/15 admin-dark:text-red-300",
};

export default function AdminAuditLogPage() {
  const [items, setItems] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await adminApi.list<AuditLogEntry>("audit-log");
        setItems(data);
      } catch (e) {
        setError(e instanceof ApiError ? e.message : "Erreur de chargement.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      <h2 className="font-display text-xl font-semibold text-admin-text">Journal d'activité</h2>
      <p className="mt-1 text-sm text-admin-text-dim">
        Historique des créations, modifications et suppressions effectuées depuis le panneau d'administration.
      </p>

      {loading && <p className="mt-4 text-sm text-admin-text-dim">Chargement…</p>}
      {error && <p className="mt-4 text-sm text-red-600 admin-dark:text-red-400">{error}</p>}

      {!loading && items.length === 0 && (
        <p className="mt-4 text-sm text-admin-text-dim">Aucune activité enregistrée pour le moment.</p>
      )}

      {items.length > 0 && (
        <div className="mt-5 overflow-x-auto rounded-3xl bg-admin-surface shadow-soft">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-admin-border text-xs font-semibold uppercase tracking-wide text-admin-text-dim">
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Utilisateur</th>
                <th className="px-5 py-3">Action</th>
                <th className="px-5 py-3">Ressource</th>
                <th className="px-5 py-3">Élément</th>
              </tr>
            </thead>
            <tbody>
              {items.map((entry) => (
                <tr key={entry.id} className="border-b border-admin-border/60 last:border-0">
                  <td className="whitespace-nowrap px-5 py-3 text-admin-text-dim">
                    {new Date(entry.created_at).toLocaleString("fr-FR")}
                  </td>
                  <td className="px-5 py-3 font-medium text-admin-text">{entry.username}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${ACTION_STYLES[entry.action]}`}>
                      {ACTION_LABELS[entry.action]}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-admin-text-dim">{entry.resource}</td>
                  <td className="max-w-xs truncate px-5 py-3 text-admin-text-dim">{entry.object_repr}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
