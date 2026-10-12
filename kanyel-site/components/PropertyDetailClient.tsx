"use client";

import { useState } from "react";
import Image from "next/image";
import Lightbox from "./Lightbox";
import PropertyVisitModal from "./PropertyVisitModal";
import { pick, type ApiProperty, type ApiPropertyImage, type Locale } from "@/lib/api";

export default function PropertyDetailClient({
  property,
  images,
  locale,
  t,
}: {
  property: ApiProperty;
  images: ApiPropertyImage[];
  locale: Locale;
  t: Record<string, string>;
}) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [visitOpen, setVisitOpen] = useState(false);

  const gallery = [property.image, ...images.map((img) => img.image)];
  const title = pick(property, "title", locale);

  return (
    <>
      {gallery.length > 1 && (
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {gallery.slice(1).map((src, i) => (
            <button
              key={src}
              onClick={() => setLightboxIndex(i + 1)}
              className="group relative aspect-square overflow-hidden rounded-2xl"
            >
              <Image
                src={src}
                alt={`${title} — ${i + 2}`}
                fill
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-cover transition-transform group-hover:scale-105"
              />
            </button>
          ))}
        </div>
      )}

      <button
        onClick={() => setVisitOpen(true)}
        className="mt-10 inline-flex rounded-full bg-navy px-7 py-3.5 text-sm font-semibold text-white shadow-soft transition-transform hover:-translate-y-0.5"
      >
        {t.requestVisit}
      </button>

      {lightboxIndex !== null && (
        <Lightbox images={gallery} initialIndex={lightboxIndex} alt={title} onClose={() => setLightboxIndex(null)} />
      )}

      {visitOpen && (
        <PropertyVisitModal propertyId={property.id} propertyTitle={title} onClose={() => setVisitOpen(false)} />
      )}
    </>
  );
}
