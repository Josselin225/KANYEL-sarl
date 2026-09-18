"use client";

import { useState } from "react";
import Image from "next/image";
import { RevealGroup, RevealItem } from "./Reveal";
import Lightbox from "./Lightbox";
import ShareButtons from "./ShareButtons";
import { pick, SITE_URL, type ApiRealisation, type ApiRealisationImage, type Locale } from "@/lib/api";

export default function RealisationsGridClient({
  realisations,
  imagesByRealisation,
  locale,
  t,
}: {
  realisations: ApiRealisation[];
  imagesByRealisation: Record<number, ApiRealisationImage[]>;
  locale: Locale;
  t: Record<string, string>;
}) {
  const [lightbox, setLightbox] = useState<{ images: string[]; alt: string } | null>(null);

  function openLightbox(r: ApiRealisation) {
    const gallery = imagesByRealisation[r.id] ?? [];
    setLightbox({ images: [r.image, ...gallery.map((g) => g.image)], alt: pick(r, "title", locale) });
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString(locale === "en" ? "en-US" : "fr-FR", {
      year: "numeric",
      month: "long",
    });
  }

  return (
    <>
      <RevealGroup className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {realisations.map((r) => {
          const galleryCount = (imagesByRealisation[r.id]?.length ?? 0) + 1;
          return (
            <RevealItem key={r.id} className="overflow-hidden rounded-3xl bg-white shadow-soft">
              <button
                onClick={() => openLightbox(r)}
                className="group relative block aspect-[4/3] w-full"
                aria-label={pick(r, "title", locale)}
              >
                <Image
                  src={r.image}
                  alt={pick(r, "title", locale)}
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
              <div className="p-6">
                <h3 className="font-display text-lg font-semibold text-navy">{pick(r, "title", locale)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-dim">{pick(r, "description", locale)}</p>
                <div className="mt-4 space-y-1 text-xs text-ink-dim">
                  {r.client_name && (
                    <p>
                      <span className="font-semibold text-gold-dark">{t.clientLabel} :</span> {r.client_name}
                    </p>
                  )}
                  {r.completed_at && (
                    <p>
                      <span className="font-semibold text-gold-dark">{t.completedLabel} :</span>{" "}
                      {formatDate(r.completed_at)}
                    </p>
                  )}
                </div>
                <div className="mt-4 border-t border-border pt-4">
                  <ShareButtons
                    url={`${SITE_URL}/${locale}/realisations`}
                    title={pick(r, "title", locale)}
                    label={t.shareLabel}
                    whatsappLabel={t.shareWhatsapp}
                    facebookLabel={t.shareFacebook}
                  />
                </div>
              </div>
            </RevealItem>
          );
        })}
      </RevealGroup>

      {lightbox && (
        <Lightbox images={lightbox.images} initialIndex={0} alt={lightbox.alt} onClose={() => setLightbox(null)} />
      )}
    </>
  );
}
