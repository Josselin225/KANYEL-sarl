"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { RevealGroup, RevealItem } from "./Reveal";
import Lightbox from "./Lightbox";
import { pick, type ApiProperty, type ApiPropertyImage, type Locale, type PropertyCategory } from "@/lib/api";

const CATEGORIES: PropertyCategory[] = ["villa", "appartement", "terrain", "bureau_commerce", "immeuble"];

function parsePrice(price: string): number | null {
  const digits = price.replace(/[^\d]/g, "");
  return digits ? Number(digits) : null;
}

export default function PropertiesGridClient({
  properties,
  imagesByProperty,
  locale,
  t,
}: {
  properties: ApiProperty[];
  imagesByProperty: Record<number, ApiPropertyImage[]>;
  locale: Locale;
  t: Record<string, string>;
}) {
  const [category, setCategory] = useState<PropertyCategory | "all">("all");
  const [location, setLocation] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number; alt: string } | null>(null);

  const filtered = useMemo(() => {
    return properties.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (location.trim() && !p.location.toLowerCase().includes(location.trim().toLowerCase())) return false;
      const numericPrice = parsePrice(p.price);
      if (minPrice && (numericPrice === null || numericPrice < Number(minPrice))) return false;
      if (maxPrice && (numericPrice === null || numericPrice > Number(maxPrice))) return false;
      return true;
    });
  }, [properties, category, location, minPrice, maxPrice]);

  const hasActiveFilters = category !== "all" || location || minPrice || maxPrice;

  function resetFilters() {
    setCategory("all");
    setLocation("");
    setMinPrice("");
    setMaxPrice("");
  }

  function openLightbox(p: ApiProperty) {
    const gallery = imagesByProperty[p.id] ?? [];
    const images = [p.image, ...gallery.map((g) => g.image)];
    setLightbox({ images, index: 0, alt: pick(p, "title", locale) });
  }

  return (
    <>
      <div className="mb-8 flex flex-wrap items-center gap-3 rounded-2xl bg-white p-4 shadow-soft">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as PropertyCategory | "all")}
          className="rounded-xl border border-border px-3.5 py-2 text-sm outline-none focus:border-navy"
        >
          <option value="all">{t.filterAll}</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {t[c]}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder={t.filterLocation}
          className="min-w-[160px] flex-1 rounded-xl border border-border px-3.5 py-2 text-sm outline-none focus:border-navy"
        />
        <input
          type="number"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          placeholder={t.filterMinPrice}
          className="w-36 rounded-xl border border-border px-3.5 py-2 text-sm outline-none focus:border-navy"
        />
        <input
          type="number"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          placeholder={t.filterMaxPrice}
          className="w-36 rounded-xl border border-border px-3.5 py-2 text-sm outline-none focus:border-navy"
        />
        {hasActiveFilters && (
          <button onClick={resetFilters} className="text-sm font-semibold text-gold-dark hover:underline">
            {t.filterReset}
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-2xl bg-white p-6 text-center text-sm text-ink-dim shadow-soft">{t.noResults}</p>
      ) : (
        <div className="space-y-14">
          {CATEGORIES.filter((c) => category === "all" || category === c).map((cat) => {
            const items = filtered.filter((p) => p.category === cat);
            if (items.length === 0 && hasActiveFilters) return null;
            return (
              <div key={cat}>
                <h3 className="font-display text-xl font-semibold text-navy">{t[cat]}</h3>
                {items.length === 0 ? (
                  <p className="mt-3 text-sm text-ink-dim">{t.empty}</p>
                ) : (
                <RevealGroup className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((p) => {
                    const galleryCount = (imagesByProperty[p.id]?.length ?? 0) + 1;
                    return (
                      <RevealItem key={p.id} className="overflow-hidden rounded-3xl bg-white shadow-soft">
                        <button
                          onClick={() => openLightbox(p)}
                          className="group relative block aspect-[4/3] w-full"
                          aria-label={pick(p, "title", locale)}
                        >
                          <Image
                            src={p.image}
                            alt={pick(p, "title", locale)}
                            fill
                            sizes="(max-width: 1024px) 100vw, 33vw"
                            className="object-cover transition-transform group-hover:scale-105"
                          />
                          {galleryCount > 1 && (
                            <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-navy-deep/70 px-2.5 py-1 text-[11px] font-semibold text-white">
                              <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
                                <path d="M4 5h13v14H4V5Zm0 0 3-3h9l3 3M8 12l2.5 3 2-2 3.5 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                              {galleryCount}
                            </span>
                          )}
                        </button>
                        <div className="p-5">
                          <h4 className="font-display text-base font-semibold text-navy">{pick(p, "title", locale)}</h4>
                          {p.location && <p className="mt-1 text-xs text-ink-dim">{p.location}</p>}
                          <p className="mt-2 text-sm leading-relaxed text-ink-dim">{pick(p, "description", locale)}</p>
                          <p className="mt-3 font-display text-sm font-semibold text-gold-dark">
                            {p.price || t.priceOnRequest}
                          </p>
                        </div>
                      </RevealItem>
                    );
                  })}
                </RevealGroup>
                )}
              </div>
            );
          })}
        </div>
      )}

      {lightbox && (
        <Lightbox images={lightbox.images} initialIndex={lightbox.index} alt={lightbox.alt} onClose={() => setLightbox(null)} />
      )}
    </>
  );
}
