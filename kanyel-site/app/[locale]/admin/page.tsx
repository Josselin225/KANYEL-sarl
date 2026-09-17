"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { adminApi } from "@/lib/adminApi";

interface Counts {
  departments: number;
  properties: number;
  testimonials: number;
  credentials: number;
  partners: number;
  gallery: number;
  stats: number;
  jobs: number;
  unreadApplications: number;
  unreadMessages: number;
  visitCount: number;
}

const CARDS: { key: keyof Counts; label: string; href: string }[] = [
  { key: "departments", label: "Activités", href: "/admin/departments" },
  { key: "properties", label: "Biens immobiliers", href: "/admin/properties" },
  { key: "testimonials", label: "Témoignages", href: "/admin/testimonials" },
  { key: "credentials", label: "Reconnaissances", href: "/admin/credentials" },
  { key: "partners", label: "Partenaires", href: "/admin/partners" },
  { key: "gallery", label: "Photos galerie", href: "/admin/gallery" },
  { key: "stats", label: "Statistiques clés", href: "/admin/stats" },
  { key: "jobs", label: "Offres d'emploi", href: "/admin/jobs" },
  { key: "unreadApplications", label: "Candidatures non lues", href: "/admin/job-applications" },
  { key: "unreadMessages", label: "Messages non lus", href: "/admin/messages" },
  { key: "visitCount", label: "Visiteurs du site", href: "/admin/settings" },
];

export default function AdminDashboardPage() {
  const locale = useLocale();
  const [counts, setCounts] = useState<Counts | null>(null);

  useEffect(() => {
    (async () => {
      const [departments, properties, testimonials, credentials, partners, gallery, stats, jobs, applications, messages, settings] =
        await Promise.all([
          adminApi.list<unknown[]>("departments").catch(() => []),
          adminApi.list<unknown[]>("properties").catch(() => []),
          adminApi.list<unknown[]>("testimonials").catch(() => []),
          adminApi.list<unknown[]>("credentials").catch(() => []),
          adminApi.list<unknown[]>("partners").catch(() => []),
          adminApi.list<unknown[]>("gallery").catch(() => []),
          adminApi.list<unknown[]>("stats").catch(() => []),
          adminApi.list<unknown[]>("jobs").catch(() => []),
          adminApi.list<{ is_read: boolean }>("job-applications").catch(() => []),
          adminApi.list<{ is_read: boolean }>("messages").catch(() => []),
          adminApi.getSingleton<{ visit_count: number }>("settings").catch(() => ({ visit_count: 0 })),
        ]);
      setCounts({
        departments: departments.length,
        properties: properties.length,
        testimonials: testimonials.length,
        credentials: credentials.length,
        partners: partners.length,
        gallery: gallery.length,
        stats: stats.length,
        jobs: jobs.length,
        unreadApplications: applications.filter((a) => !a.is_read).length,
        unreadMessages: messages.filter((m) => !m.is_read).length,
        visitCount: settings.visit_count,
      });
    })();
  }, []);

  return (
    <div>
      <h2 className="font-display text-xl font-semibold text-navy">Tableau de bord</h2>
      <p className="mt-1 text-sm text-ink-dim">Vue d&apos;ensemble du contenu du site KANYEL SARL.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {CARDS.map((card) => (
          <a
            key={card.key}
            href={`/${locale}${card.href}`}
            className="rounded-3xl bg-white p-5 shadow-soft transition-transform hover:-translate-y-0.5"
          >
            <p className="font-display text-3xl font-semibold text-navy">
              {counts ? counts[card.key] : "…"}
            </p>
            <p className="mt-1 text-sm text-ink-dim">{card.label}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
