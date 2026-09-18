"use client";

import { useEffect, useState } from "react";
import { adminApi, ApiError } from "@/lib/adminApi";
import type { ResourceConfig } from "@/lib/adminResources";
import AdminField from "./AdminField";

type Item = Record<string, any>;

export default function ResourceCrud({ resource }: { resource: ResourceConfig }) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Item | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.list<Item>(resource.key);
      setItems(data);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Erreur de chargement.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    setEditing(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resource.key]);

  function startCreate() {
    const initial: Record<string, unknown> = {};
    for (const f of resource.fields) {
      if (f.type === "boolean") initial[f.name] = f.name === "is_published";
      else if (f.type === "number") initial[f.name] = 0;
      else if (f.type === "select") initial[f.name] = f.options?.[0]?.value ?? "";
      else initial[f.name] = "";
    }
    setEditing({});
    setForm(initial);
    setSaveError(null);
  }

  function startEdit(item: Item) {
    setEditing(item);
    setForm({ ...item });
    setSaveError(null);
  }

  function cancelEdit() {
    setEditing(null);
    setForm({});
    setSaveError(null);
  }

  const hasImageField = resource.fields.some((f) => f.type === "image");
  const isNew = editing !== null && Object.keys(editing).length === 0;

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    try {
      let payload: Record<string, unknown> | FormData;
      if (hasImageField) {
        const fd = new FormData();
        for (const f of resource.fields) {
          const val = form[f.name];
          if (f.type === "image") {
            if (val instanceof File) fd.append(f.name, val);
          } else if (f.type === "boolean") {
            fd.append(f.name, val ? "true" : "false");
          } else if (f.type === "date" && !val) {
            // Omit empty optional dates — DRF rejects "" as an invalid date format.
          } else {
            fd.append(f.name, String(val ?? ""));
          }
        }
        payload = fd;
      } else {
        const data: Record<string, unknown> = { ...form };
        for (const f of resource.fields) {
          if (f.type === "date" && !data[f.name]) delete data[f.name];
        }
        payload = data;
      }

      if (isNew) {
        const created = await adminApi.create<Item>(resource.key, payload);
        setItems((prev) => [...prev, created]);
      } else if (editing) {
        const id = editing[resource.idField];
        const updated = await adminApi.update<Item>(resource.key, id, payload);
        setItems((prev) => prev.map((it) => (it[resource.idField] === id ? updated : it)));
      }
      cancelEdit();
    } catch (e) {
      setSaveError(e instanceof ApiError ? e.message : "Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item: Item) {
    if (!confirm("Supprimer cet élément définitivement ?")) return;
    try {
      await adminApi.remove(resource.key, item[resource.idField]);
      setItems((prev) => prev.filter((it) => it[resource.idField] !== item[resource.idField]));
      cancelEdit();
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "Erreur lors de la suppression.");
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-admin-text">{resource.label}</h2>
          <button
            onClick={startCreate}
            className="rounded-full bg-admin-accent px-4 py-2 text-xs font-semibold text-admin-accent-text shadow-soft transition-transform hover:-translate-y-0.5"
          >
            + Ajouter
          </button>
        </div>

        {loading && <p className="mt-4 text-sm text-admin-text-dim">Chargement…</p>}
        {error && <p className="mt-4 text-sm text-red-600 admin-dark:text-red-400">{error}</p>}

        <ul className="mt-4 space-y-2">
          {items.map((item) => (
            <li key={item[resource.idField]}>
              <button
                onClick={() => startEdit(item)}
                className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-colors ${
                  editing === item
                    ? "border-admin-accent bg-admin-surface-hover"
                    : "border-admin-border bg-admin-surface hover:border-admin-accent/40"
                }`}
              >
                {resource.imageField && item[resource.imageField] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item[resource.imageField]}
                    alt=""
                    className="h-11 w-11 shrink-0 rounded-lg object-cover"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-admin-text">{item[resource.titleField]}</p>
                  {resource.subtitleField && (
                    <p className="truncate text-xs text-admin-text-dim">{item[resource.subtitleField]}</p>
                  )}
                </div>
                {"is_published" in item && !item.is_published && (
                  <span className="shrink-0 rounded-full bg-admin-text-dim/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-admin-text-dim">
                    Brouillon
                  </span>
                )}
              </button>
            </li>
          ))}
          {!loading && items.length === 0 && (
            <p className="text-sm text-admin-text-dim">Aucun élément pour le moment.</p>
          )}
        </ul>
      </div>

      <div className="lg:col-span-3">
        {editing ? (
          <div className="rounded-3xl bg-admin-surface p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold text-admin-text">
                {isNew ? "Nouvel élément" : "Modifier"}
              </h3>
              {!isNew && (
                <button
                  onClick={() => handleDelete(editing)}
                  className="text-xs font-semibold text-red-600 hover:underline admin-dark:text-red-400"
                >
                  Supprimer
                </button>
              )}
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {resource.fields.map((f) => (
                <div key={f.name} className={f.type === "textarea" || f.type === "image" ? "sm:col-span-2" : ""}>
                  <AdminField
                    field={f}
                    value={form[f.name]}
                    onChange={(v) => setForm((prev) => ({ ...prev, [f.name]: v }))}
                    currentImageUrl={
                      f.type === "image" && typeof editing[f.name] === "string" ? editing[f.name] : null
                    }
                  />
                </div>
              ))}
            </div>

            {resource.fields.some((f) => f.required) && (
              <p className="mt-4 text-xs text-admin-text-dim">
                <span className="text-gold-dark">*</span> Champ obligatoire
              </p>
            )}

            {saveError && <p className="mt-4 text-sm text-red-600 admin-dark:text-red-400">{saveError}</p>}

            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-full bg-admin-accent px-6 py-2.5 text-sm font-semibold text-admin-accent-text shadow-soft transition-transform hover:-translate-y-0.5 disabled:opacity-60"
              >
                {saving ? "Enregistrement…" : "Enregistrer"}
              </button>
              <button onClick={cancelEdit} className="text-sm font-semibold text-admin-text-dim hover:text-admin-text">
                Annuler
              </button>
            </div>
          </div>
        ) : (
          <div className="flex h-full min-h-[240px] items-center justify-center rounded-3xl border border-dashed border-admin-border text-sm text-admin-text-dim">
            Sélectionnez un élément à modifier, ou ajoutez-en un nouveau.
          </div>
        )}
      </div>
    </div>
  );
}
