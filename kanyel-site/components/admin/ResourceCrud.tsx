"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { adminApi, ApiError } from "@/lib/adminApi";
import type { ResourceConfig } from "@/lib/adminResources";
import AdminField from "./AdminField";

type Item = Record<string, any>;

export default function ResourceCrud({ resource }: { resource: ResourceConfig }) {
  const searchParams = useSearchParams();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Item | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string | number>>(new Set());
  const [bulkWorking, setBulkWorking] = useState(false);

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
    setSelected(new Set());
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

  useEffect(() => {
    if (searchParams.get("new") === "1") startCreate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resource.key]);

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
  const hasPublishField = resource.fields.some((f) => f.name === "is_published");
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
          } else if ((f.type === "date" || f.type === "number") && (val === null || val === undefined)) {
            // Omit empty optional dates/numbers — DRF rejects "" as an invalid value for them.
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

  function toggleSelected(id: string | number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelected((prev) =>
      prev.size === items.length ? new Set() : new Set(items.map((it) => it[resource.idField]))
    );
  }

  async function handleBulkPublish(value: boolean) {
    setBulkWorking(true);
    try {
      const ids = Array.from(selected);
      const updated = await Promise.all(
        ids.map((id) => adminApi.update<Item>(resource.key, id, { is_published: value }))
      );
      setItems((prev) =>
        prev.map((it) => updated.find((u) => u[resource.idField] === it[resource.idField]) ?? it)
      );
      setSelected(new Set());
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "Erreur lors de la mise à jour groupée.");
    } finally {
      setBulkWorking(false);
    }
  }

  async function handleBulkDelete() {
    if (!confirm(`Supprimer définitivement ces ${selected.size} élément(s) ?`)) return;
    setBulkWorking(true);
    try {
      const ids = Array.from(selected);
      await Promise.all(ids.map((id) => adminApi.remove(resource.key, id)));
      setItems((prev) => prev.filter((it) => !selected.has(it[resource.idField])));
      setSelected(new Set());
      cancelEdit();
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "Erreur lors de la suppression groupée.");
    } finally {
      setBulkWorking(false);
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

        {items.length > 0 && (
          <div className="mt-4 flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs font-semibold text-admin-text-dim">
              <input
                type="checkbox"
                checked={selected.size === items.length}
                onChange={toggleSelectAll}
                className="h-4 w-4 accent-admin-accent"
              />
              Tout sélectionner
            </label>
            {selected.size > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-admin-text-dim">{selected.size} sélectionné(s)</span>
                {hasPublishField && (
                  <>
                    <button
                      onClick={() => handleBulkPublish(true)}
                      disabled={bulkWorking}
                      className="rounded-full bg-admin-surface-hover px-3 py-1 text-xs font-semibold text-admin-text transition-colors hover:bg-admin-accent hover:text-admin-accent-text disabled:opacity-60"
                    >
                      Publier
                    </button>
                    <button
                      onClick={() => handleBulkPublish(false)}
                      disabled={bulkWorking}
                      className="rounded-full bg-admin-surface-hover px-3 py-1 text-xs font-semibold text-admin-text transition-colors hover:bg-admin-accent hover:text-admin-accent-text disabled:opacity-60"
                    >
                      Dépublier
                    </button>
                  </>
                )}
                <button
                  onClick={handleBulkDelete}
                  disabled={bulkWorking}
                  className="rounded-full bg-red-600/10 px-3 py-1 text-xs font-semibold text-red-600 transition-colors hover:bg-red-600 hover:text-white disabled:opacity-60 admin-dark:text-red-400"
                >
                  Supprimer
                </button>
              </div>
            )}
          </div>
        )}

        <ul className="mt-4 space-y-2">
          {items.map((item) => (
            <li key={item[resource.idField]} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selected.has(item[resource.idField])}
                onChange={() => toggleSelected(item[resource.idField])}
                className="h-4 w-4 shrink-0 accent-admin-accent"
              />
              <button
                onClick={() => startEdit(item)}
                className={`flex w-full min-w-0 items-center gap-3 rounded-2xl border p-3 text-left transition-colors ${
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
