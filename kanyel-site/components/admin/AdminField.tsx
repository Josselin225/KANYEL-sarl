"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { adminApi } from "@/lib/adminApi";
import type { FieldConfig, FieldOption } from "@/lib/adminResources";

export default function AdminField({
  field,
  value,
  onChange,
  currentImageUrl,
}: {
  field: FieldConfig;
  value: unknown;
  onChange: (value: unknown) => void;
  currentImageUrl?: string | null;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [relationOptions, setRelationOptions] = useState<FieldOption[] | null>(null);

  useEffect(() => {
    if (field.type !== "relation" || !field.relatedResource) return;
    let cancelled = false;
    adminApi
      .list<Record<string, unknown>>(field.relatedResource)
      .then((items) => {
        if (cancelled) return;
        const opts = items.map((item) => ({
          value: String(item[field.relatedValueField ?? "id"]),
          label: String(item[field.relatedLabelField ?? "id"]),
        }));
        setRelationOptions(opts);
        if (!value && opts.length > 0) onChange(opts[0].value);
      })
      .catch(() => setRelationOptions([]));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [field.type, field.relatedResource]);

  const baseInputClass =
    "w-full rounded-xl border border-admin-border bg-admin-bg px-3.5 py-2.5 text-sm text-admin-text outline-none transition-colors focus:border-admin-accent";

  return (
    <div>
      <label className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-admin-text-dim">
        {field.label}
        {field.required && <span className="text-gold-dark">*</span>}
      </label>

      {field.type === "text" && (
        <input
          type="text"
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
          className={baseInputClass}
        />
      )}

      {field.type === "textarea" && (
        <textarea
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          required={field.required}
          className={baseInputClass}
        />
      )}

      {field.type === "number" && (
        <input
          type="number"
          step="any"
          value={value === null || value === undefined ? "" : (value as number)}
          onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
          required={field.required}
          className={baseInputClass}
        />
      )}

      {field.type === "select" && (
        <select
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
          className={baseInputClass}
        >
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}

      {field.type === "relation" && relationOptions && relationOptions.length === 0 ? (
        <p className="rounded-xl border border-dashed border-admin-border bg-admin-bg px-3.5 py-2.5 text-sm text-admin-text-dim">
          Aucun élément disponible pour « {field.label} » pour le moment.{" "}
          <Link
            href={`/admin/${field.relatedResource}?new=1`}
            className="font-semibold text-admin-accent hover:underline"
          >
            En créer un
          </Link>{" "}
          d&apos;abord.
        </p>
      ) : (
        field.type === "relation" && (
          <select
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
            className={baseInputClass}
            disabled={!relationOptions}
          >
            {!relationOptions && <option>Chargement…</option>}
            {relationOptions?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )
      )}

      {field.type === "date" && (
        <input
          type="date"
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
          className={baseInputClass}
        />
      )}

      {field.type === "boolean" && (
        <label className="flex items-center gap-2.5 rounded-xl border border-admin-border bg-admin-bg px-3.5 py-2.5">
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
            className="h-4 w-4 accent-admin-accent"
          />
          <span className="text-sm text-admin-text-dim">Activé</span>
        </label>
      )}

      {field.type === "image" && (
        <div className="space-y-2">
          {(preview || currentImageUrl) && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview || currentImageUrl || ""}
              alt=""
              className="h-24 w-24 rounded-xl border border-admin-border object-cover"
            />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              onChange(file);
              if (file) setPreview(URL.createObjectURL(file));
            }}
            className="block w-full text-sm text-admin-text-dim file:mr-3 file:rounded-full file:border-0 file:bg-admin-surface-hover file:px-4 file:py-2 file:text-xs file:font-semibold file:text-admin-text hover:file:bg-admin-accent/10"
          />
        </div>
      )}

      {field.help && <p className="mt-1.5 text-xs text-admin-text-dim">{field.help}</p>}
    </div>
  );
}
