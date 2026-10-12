"use client";

import { useState } from "react";
import Image from "next/image";
import Lightbox from "./Lightbox";
import ShareButtons from "./ShareButtons";
import { pick, SITE_URL, type ApiRealisation, type ApiRealisationImage, type Locale } from "@/lib/api";

export default function RealisationDetailClient({
  realisation,
  images,
  locale,
  shareLabels,
}: {
  realisation: ApiRealisation;
  images: ApiRealisationImage[];
  locale: Locale;
  shareLabels: { label: string; whatsapp: string; facebook: string };
}) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const gallery = [realisation.image, ...images.map((img) => img.image)];
  const title = pick(realisation, "title", locale);

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

      <div className="mt-10 border-t border-border pt-6">
        <ShareButtons
          url={`${SITE_URL}/${locale}/realisations/${realisation.id}`}
          title={title}
          label={shareLabels.label}
          whatsappLabel={shareLabels.whatsapp}
          facebookLabel={shareLabels.facebook}
        />
      </div>

      {lightboxIndex !== null && (
        <Lightbox images={gallery} initialIndex={lightboxIndex} alt={title} onClose={() => setLightboxIndex(null)} />
      )}
    </>
  );
}
