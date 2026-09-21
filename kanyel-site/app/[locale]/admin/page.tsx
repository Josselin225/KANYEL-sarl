"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
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
  realisations: number;
  articles: number;
  faqs: number;
  unreadApplications: number;
  unreadMessages: number;
  unreadQuotes: number;
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
  { key: "realisations", label: "Réalisations", href: "/admin/realisations", roles: ["full"] },
  { key: "articles", label: "Actualités", href: "/admin/articles", roles: ["full"] },
  { key: "faqs", label: "Questions fréquentes", href: "/admin/faqs", roles: ["full"] },
  { key: "unreadApplications", label: "Candidatures non lues", href: "/admin/job-applications" },
  { key: "unreadMessages", label: "Messages non lus", href: "/admin/messages" },
  { key: "unreadQuotes", label: "Devis non lus", href: "/admin/quote-requests" },
  { key: "visitCount", label: "Visiteurs du site", href: "/admin/settings", roles: ["full"] },
];

const DRAFT_RESOURCES: { key: string; label: string; href: string }[] = [
  { key: "departments", label: "Activités", href: "/admin/departments" },
  { key: "properties", label: "Biens immobiliers", href: "/admin/properties" },
  { key: "testimonials", label: "Témoignages", href: "/admin/testimonials" },
  { key: "credentials", label: "Reconnaissances", href: "/admin/credentials" },
  { key: "partners", label: "Partenaires", href: "/admin/partners" },
  { key: "gallery", label: "Photos galerie", href: "/admin/gallery" },
  { key: "jobs", label: "Offres d'emploi", href: "/admin/jobs" },
  { key: "realisations", label: "Réalisations", href: "/admin/realisations" },
  { key: "articles", label: "Actualités", href: "/admin/articles" },
  { key: "faqs", label: "Questions fréquentes", href: "/admin/faqs" },
];

const QUICK_ACTIONS: { label: string; href: string }[] = [
  { label: "+ Nouvelle actualité", href: "/admin/articles?new=1" },
  { label: "+ Nouveau bien immobilier", href: "/admin/properties?new=1" },
  { label: "+ Nouvelle réalisation", href: "/admin/realisations?new=1" },
  { label: "+ Nouvelle offre d'emploi", href: "/admin/jobs?new=1" },
];

interface VisitPoint {
  date: string;
  count: number;
}

interface PreviewMessage {
  id: number;
  name: string;
  subject: string;
  message: string;
  created_at: string;
  is_read: boolean;
}
interface PreviewApplication {
  id: number;
  full_name: string;
  job_title: string | null;
  message: string;
  created_at: string;
  is_read: boolean;
}
interface PreviewQuote {
  id: number;
  full_name: string;
  department_title: string | null;
  description: string;
  created_at: string;
  is_read: boolean;
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
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

function PreviewColumn({
  title,
  href,
  emptyLabel,
  items,
}: {
  title: string;
  href: string;
  emptyLabel: string;
  items: { id: number; title: string; subtitle: string; snippet: string; date: string }[];
}) {
  return (
    <div className="rounded-3xl bg-admin-surface p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <h4 className="font-display text-sm font-semibold text-admin-text">{title}</h4>
        <Link href={href} className="text-xs font-semibold text-admin-accent hover:underline">
          Voir tout
        </Link>
      </div>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-admin-text-dim">{emptyLabel}</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {items.map((item) => (
            <li key={item.id}>
              <Link href={href} className="block rounded-xl px-2 py-1.5 transition-colors hover:bg-admin-surface-hover">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold text-admin-text">{item.title}</p>
                  <span className="shrink-0 text-[11px] text-admin-text-dim">{item.date}</span>
                </div>
                {item.subtitle && <p className="truncate text-xs text-admin-text-dim">{item.subtitle}</p>}
                <p className="mt-0.5 truncate text-xs text-admin-text-dim/80">{item.snippet}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function AdminDashboardPage() {
  const role = getRole();
  const [counts, setCounts] = useState<Counts | null>(null);
  const [draftCounts, setDraftCounts] = useState<Record<string, number> | null>(null);
  const [visits, setVisits] = useState<VisitPoint[] | null>(null);
  const [unreadMessages, setUnreadMessages] = useState<PreviewMessage[]>([]);
  const [unreadApplications, setUnreadApplications] = useState<PreviewApplication[]>([]);
  const [unreadQuotes, setUnreadQuotes] = useState<PreviewQuote[]>([]);
  const cards = CARDS.filter((c) => !c.roles || c.roles.includes(role));
  const isFull = role === "full";

  useEffect(() => {
    (async () => {
      const [
        departments,
        properties,
        testimonials,
        credentials,
        partners,
        gallery,
        stats,
        jobs,
        realisations,
        articles,
        faqs,
        applications,
        messages,
        quotes,
        settings,
      ] = await Promise.all([
        adminApi.list<{ is_published?: boolean }>("departments").catch(() => []),
        adminApi.list<{ is_published?: boolean }>("properties").catch(() => []),
        adminApi.list<{ is_published?: boolean }>("testimonials").catch(() => []),
        adminApi.list<{ is_published?: boolean }>("credentials").catch(() => []),
        adminApi.list<{ is_published?: boolean }>("partners").catch(() => []),
        adminApi.list<{ is_published?: boolean }>("gallery").catch(() => []),
        adminApi.list<{ is_published?: boolean }>("stats").catch(() => []),
        adminApi.list<{ is_published?: boolean }>("jobs").catch(() => []),
        adminApi.list<{ is_published?: boolean }>("realisations").catch(() => []),
        adminApi.list<{ is_published?: boolean }>("articles").catch(() => []),
        adminApi.list<{ is_published?: boolean }>("faqs").catch(() => []),
        adminApi.list<PreviewApplication>("job-applications").catch(() => []),
        adminApi.list<PreviewMessage>("messages").catch(() => []),
        adminApi.list<PreviewQuote>("quote-requests").catch(() => []),
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
        realisations: realisations.length,
        articles: articles.length,
        faqs: faqs.length,
        unreadApplications: applications.filter((a) => !a.is_read).length,
        unreadMessages: messages.filter((m) => !m.is_read).length,
        unreadQuotes: quotes.filter((q) => !q.is_read).length,
        visitCount: settings.visit_count,
      });

      const byKey: Record<string, { is_published?: boolean }[]> = {
        departments,
        properties,
        testimonials,
        credentials,
        partners,
        gallery,
        jobs,
        realisations,
        articles,
        faqs,
      };
      const drafts: Record<string, number> = {};
      for (const [key, list] of Object.entries(byKey)) {
        drafts[key] = list.filter((it) => it.is_published === false).length;
      }
      setDraftCounts(drafts);

      setUnreadMessages(messages.filter((m) => !m.is_read).slice(0, 3));
      setUnreadApplications(applications.filter((a) => !a.is_read).slice(0, 3));
      setUnreadQuotes(quotes.filter((q) => !q.is_read).slice(0, 3));

      const stats30 = await adminApi.list<VisitPoint>("visit-stats").catch(() => []);
      setVisits(stats30);
    })();
  }, []);

  const draftsWithContent = draftCounts
    ? DRAFT_RESOURCES.filter((r) => (draftCounts[r.key] ?? 0) > 0)
    : [];

  return (
    <div>
      <h2 className="font-display text-xl font-semibold text-admin-text">Tableau de bord</h2>
      <p className="mt-1 text-sm text-admin-text-dim">Vue d&apos;ensemble du contenu du site KANYEL SARL.</p>

      {isFull && (
        <div className="mt-6 flex flex-wrap gap-3">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="rounded-full bg-admin-accent px-4 py-2 text-xs font-semibold text-admin-accent-text shadow-soft transition-transform hover:-translate-y-0.5"
            >
              {action.label}
            </Link>
          ))}
        </div>
      )}

      {isFull && draftsWithContent.length > 0 && (
        <div className="mt-6 rounded-3xl bg-gold-soft p-5 admin-dark:bg-gold-dark/15">
          <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-gold-dark admin-dark:text-gold-light">
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
              <path
                d="M12 3 2 20h20L12 3Zm0 6v5m0 3v.1"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Contenu en attente de publication
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {draftsWithContent.map((r) => (
              <Link
                key={r.key}
                href={r.href}
                className="rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-gold-dark shadow-soft transition-transform hover:-translate-y-0.5 admin-dark:bg-admin-surface admin-dark:text-gold-light"
              >
                {r.label} · {draftCounts![r.key]} brouillon{draftCounts![r.key] > 1 ? "s" : ""}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.key}
            href={card.href}
            className="rounded-3xl bg-admin-surface p-5 shadow-soft transition-transform hover:-translate-y-0.5"
          >
            <p className="font-display text-3xl font-semibold text-admin-text">
              {counts ? counts[card.key] : "…"}
            </p>
            <p className="mt-1 text-sm text-admin-text-dim">{card.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <PreviewColumn
          title="Derniers messages non lus"
          href="/admin/messages"
          emptyLabel="Aucun message non lu."
          items={unreadMessages.map((m) => ({
            id: m.id,
            title: m.name,
            subtitle: m.subject || "Sans objet",
            snippet: m.message,
            date: formatDateTime(m.created_at),
          }))}
        />
        <PreviewColumn
          title="Dernières candidatures non lues"
          href="/admin/job-applications"
          emptyLabel="Aucune candidature non lue."
          items={unreadApplications.map((a) => ({
            id: a.id,
            title: a.full_name,
            subtitle: a.job_title || "Candidature spontanée",
            snippet: a.message,
            date: formatDateTime(a.created_at),
          }))}
        />
        <PreviewColumn
          title="Derniers devis non lus"
          href="/admin/quote-requests"
          emptyLabel="Aucun devis non lu."
          items={unreadQuotes.map((q) => ({
            id: q.id,
            title: q.full_name,
            subtitle: q.department_title || "Devis général",
            snippet: q.description,
            date: formatDateTime(q.created_at),
          }))}
        />
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
