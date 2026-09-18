"use client";

import { useEffect, useState } from "react";
import { adminApi, ApiError, getUsername } from "@/lib/adminApi";

interface AdminUser {
  id: number;
  username: string;
  role: "full" | "reception" | null;
  is_active: boolean;
}

const EMPTY_FORM = { username: "", role: "reception" as "full" | "reception", is_active: true, password: "" };

export default function AdminUsersPage() {
  const [items, setItems] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const myUsername = getUsername();

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.list<AdminUser>("admin-users");
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

  const isNew = editing !== null && editing.id === 0;

  function startCreate() {
    setEditing({ id: 0, username: "", role: "reception", is_active: true });
    setForm(EMPTY_FORM);
    setSaveError(null);
  }

  function startEdit(item: AdminUser) {
    setEditing(item);
    setForm({ username: item.username, role: item.role ?? "full", is_active: item.is_active, password: "" });
    setSaveError(null);
  }

  function cancelEdit() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setSaveError(null);
  }

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    try {
      const payload: Record<string, unknown> = {
        username: form.username,
        role: form.role,
        is_active: form.is_active,
      };
      if (form.password) payload.password = form.password;

      if (isNew) {
        const created = await adminApi.create<AdminUser>("admin-users", payload);
        setItems((prev) => [...prev, created]);
      } else if (editing) {
        const updated = await adminApi.update<AdminUser>("admin-users", editing.id, payload);
        setItems((prev) => prev.map((it) => (it.id === editing.id ? updated : it)));
      }
      cancelEdit();
    } catch (e) {
      setSaveError(e instanceof ApiError ? e.message : "Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item: AdminUser) {
    if (!confirm(`Supprimer le compte "${item.username}" définitivement ?`)) return;
    try {
      await adminApi.remove("admin-users", item.id);
      setItems((prev) => prev.filter((it) => it.id !== item.id));
      cancelEdit();
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "Erreur lors de la suppression.");
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-navy">Comptes admin</h2>
          <button
            onClick={startCreate}
            className="rounded-full bg-navy px-4 py-2 text-xs font-semibold text-white shadow-soft transition-transform hover:-translate-y-0.5"
          >
            + Ajouter
          </button>
        </div>

        {loading && <p className="mt-4 text-sm text-ink-dim">Chargement…</p>}
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <ul className="mt-4 space-y-2">
          {items.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => startEdit(item)}
                className={`flex w-full items-center justify-between gap-3 rounded-2xl border p-3 text-left transition-colors ${
                  editing?.id === item.id ? "border-navy bg-navy-soft" : "border-border bg-white hover:border-navy/40"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-navy">
                    {item.username}
                    {item.username === myUsername && <span className="ml-1.5 text-xs text-ink-dim">(vous)</span>}
                  </p>
                  <p className="truncate text-xs text-ink-dim">
                    {item.role === "reception" ? "Accueil (messages, candidatures, devis)" : "Accès complet"}
                  </p>
                </div>
                {!item.is_active && (
                  <span className="shrink-0 rounded-full bg-ink-dim/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-ink-dim">
                    Désactivé
                  </span>
                )}
              </button>
            </li>
          ))}
          {!loading && items.length === 0 && <p className="text-sm text-ink-dim">Aucun compte pour le moment.</p>}
        </ul>
      </div>

      <div className="lg:col-span-3">
        {editing ? (
          <div className="rounded-3xl bg-white p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold text-navy">
                {isNew ? "Nouveau compte" : "Modifier le compte"}
              </h3>
              {!isNew && editing.username !== myUsername && (
                <button
                  onClick={() => handleDelete(editing)}
                  className="text-xs font-semibold text-red-600 hover:underline"
                >
                  Supprimer
                </button>
              )}
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-ink-dim">
                  Identifiant <span className="text-gold-dark">*</span>
                </label>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
                  className="w-full rounded-xl border border-border px-3.5 py-2.5 text-sm outline-none focus:border-navy"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-ink-dim">Rôle</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value as "full" | "reception" }))}
                  className="w-full rounded-xl border border-border px-3.5 py-2.5 text-sm outline-none focus:border-navy"
                >
                  <option value="full">Accès complet</option>
                  <option value="reception">Accueil (messages, candidatures, devis uniquement)</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-ink-dim">
                  {isNew ? "Mot de passe" : "Nouveau mot de passe"}{" "}
                  {isNew && <span className="text-gold-dark">*</span>}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                  placeholder={isNew ? "" : "Laisser vide pour ne pas changer"}
                  className="w-full rounded-xl border border-border px-3.5 py-2.5 text-sm outline-none focus:border-navy"
                />
              </div>
              <label className="flex items-center gap-2.5 pt-6 text-sm text-ink-dim">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm((prev) => ({ ...prev, is_active: e.target.checked }))}
                  className="h-4 w-4 rounded border-border"
                />
                Compte actif
              </label>
            </div>

            {saveError && <p className="mt-4 text-sm text-red-600">{saveError}</p>}

            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-full bg-navy px-6 py-2.5 text-sm font-semibold text-white shadow-soft transition-transform hover:-translate-y-0.5 disabled:opacity-60"
              >
                {saving ? "Enregistrement…" : "Enregistrer"}
              </button>
              <button onClick={cancelEdit} className="text-sm font-semibold text-ink-dim hover:text-navy">
                Annuler
              </button>
            </div>
          </div>
        ) : (
          <div className="flex h-full min-h-[240px] items-center justify-center rounded-3xl border border-dashed border-border text-sm text-ink-dim">
            Sélectionnez un compte à modifier, ou ajoutez-en un nouveau.
          </div>
        )}
      </div>
    </div>
  );
}
