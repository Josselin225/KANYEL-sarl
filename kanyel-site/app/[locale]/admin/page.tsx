"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { adminApi, getRole } from "@/lib/adminApi";

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

const CARDS: { key: keyof Counts; label: string; href: string; roles?: ("full" | "reception")[] }[] = [
  { key: "departments", label: "Activités", href: "/admin/departments", roles: ["full"] },
  { key: "properties", label: "Biens immobiliers", href: "/admin/properties", roles: ["full"] },
  { key: "testimonials", label: "Témoignages", href: "/admin/testimonials", roles: ["full"] },
  { key: "credentials", label: "Reconnaissances", href: "/admin/credentials", roles: ["full"] },
  { key: "partners", label: "Partenaires", href: "/admin/partners", roles: ["full"] },
  { key: "gallery", label: "Photos galerie", href: "/admin/gallery", roles: ["full"] },
  { key: "stats", label: "Statistiques clés", href: "/admin/stats", roles: ["full"] },
  { key: "jobs", label: "Offres d'emploi", href: "/admin/jobs", roles: ["full"] },
  { key: "unreadApplications", label: "Candidatures non lues", href: "/admin/job-applications" },
  { key: "unreadMessages", label: "Messages non lus", href: "/admin/messages" },
  { key: "visitCount", label: "Visiteurs du site", href: "/admin/settings", roles: ["full"] },
];

interface VisitPoint {
  date: string;
  count: number;
}

function VisitChart({ data }: { data: VisitPoint[] }) {
  if (data.length === 0) {
    return <p className="mt-4 text-sm text-admin-text-dim">Pas encore de données de visite.</p>;
  }
  const max = Math.max(...data.map((d) => d.count), 1);
  const width = 640;
  const height = 160;
  const barGap = 3;
  const barWidth = data.length > 0 ? width / data.length - barGap : 0;

  return (
    <svg viewBox={`0 0 ${width} ${height + 24}`} className="mt-4 w-full" role="img" aria-label="Visites des 30 derniers jours">
      {data.map((d, i) => {
        const barHeight = (d.count / max) * height;
        const x = i * (barWidth + barGap);
        const label = new Date(d.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
        return (
          <g key={d.date}>
            <rect
              x={x}
              y={height - barHeight}
              width={Math.max(barWidth, 1)}
              height={barHeight}
              rx={2}
              className="fill-gold-dark/80"
            >
              <title>{`${label} : ${d.count} visite${d.count > 1 ? "s" : ""}`}</title>
            </rect>
            {(i === 0 || i === data.length - 1) && (
              <text x={x} y={height + 16} fontSize="9" className="fill-admin-text-dim">
                {label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export default function AdminDashboardPage() {
  const locale = useLocale();
  const role = getRole();
  const [counts, setCounts] = useState<Counts | null>(null);
  const [visits, setVisits] = useState<VisitPoint[] | null>(null);
  const cards = CARDS.filter((c) => !c.roles || c.roles.includes(role));

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
      const stats30 = await adminApi.list<VisitPoint>("visit-stats").catch(() => []);
      setVisits(stats30);
    })();
  }, []);

  return (
    <div>
      <h2 className="font-display text-xl font-semibold text-admin-text">Tableau de bord</h2>
      <p className="mt-1 text-sm text-admin-text-dim">Vue d&apos;ensemble du contenu du site KANYEL SARL.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <a
            key={card.key}
            href={`/${locale}${card.href}`}
            className="rounded-3xl bg-admin-surface p-5 shadow-soft transition-transform hover:-translate-y-0.5"
          >
            <p className="font-display text-3xl font-semibold text-admin-text">
              {counts ? counts[card.key] : "…"}
            </p>
            <p className="mt-1 text-sm text-admin-text-dim">{card.label}</p>
          </a>
        ))}
      </div>

      <div className="mt-8 rounded-3xl bg-admin-surface p-6 shadow-soft">
        <h3 className="font-display text-base font-semibold text-admin-text">Visites des 30 derniers jours</h3>
        {visits === null ? (
          <p className="mt-4 text-sm text-admin-text-dim">Chargement…</p>
        ) : (
          <VisitChart data={visits} />
        )}
      </div>
    </div>
  );
}
