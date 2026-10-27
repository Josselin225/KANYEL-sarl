"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { adminApi, getRole } from "@/lib/adminApi";
import CountUp from "@/components/admin/CountUp";
import Skeleton from "@/components/admin/Skeleton";

const easeOut: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: easeOut } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

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
  unreadVisitRequests: number;
  visitCount: number;
}

const CONTENT_BARS: { key: keyof Counts; label: string; href: string }[] = [
  { key: "departments", label: "Activités", href: "/admin/departments" },
  { key: "properties", label: "Biens immobiliers", href: "/admin/properties" },
  { key: "testimonials", label: "Témoignages", href: "/admin/testimonials" },
  { key: "credentials", label: "Reconnaissances", href: "/admin/credentials" },
  { key: "partners", label: "Partenaires", href: "/admin/partners" },
  { key: "gallery", label: "Photos galerie", href: "/admin/gallery" },
  { key: "stats", label: "Statistiques clés", href: "/admin/stats" },
  { key: "jobs", label: "Offres d'emploi", href: "/admin/jobs" },
  { key: "realisations", label: "Réalisations", href: "/admin/realisations" },
  { key: "articles", label: "Actualités", href: "/admin/articles" },
  { key: "faqs", label: "Questions fréquentes", href: "/admin/faqs" },
];

const REQUEST_BARS: { key: keyof Counts; label: string; href: string }[] = [
  { key: "unreadMessages", label: "Messages non lus", href: "/admin/messages" },
  { key: "unreadApplications", label: "Candidatures non lues", href: "/admin/job-applications" },
  { key: "unreadQuotes", label: "Devis non lus", href: "/admin/quote-requests" },
  { key: "unreadVisitRequests", label: "Demandes de visite non lues", href: "/admin/property-visit-requests" },
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
interface PreviewVisitRequest {
  id: number;
  full_name: string;
  property_title: string | null;
  message: string;
  created_at: string;
  is_read: boolean;
}

interface AdminProperty {
  id: number;
  category: "villa" | "appartement" | "terrain" | "bureau_commerce" | "immeuble";
  transaction_type: "location" | "vente";
  title_fr: string;
  price_amount: number | null;
  is_occupied: boolean;
  tenant_name: string;
  is_published?: boolean;
}

const PROPERTY_CATEGORY_LABELS: Record<AdminProperty["category"], string> = {
  villa: "Villas",
  appartement: "Appartements",
  terrain: "Terrains",
  bureau_commerce: "Bureaux / Commerces",
  immeuble: "Immeubles",
};

// Fixed-order, colorblind-safe categorical palette (validated set — see the
// dataviz skill's reference palette). Order must stay fixed across renders.
const CATEGORY_COLORS = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4"];

function groupAndCount<T>(items: T[], keyOf: (item: T) => string): { label: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    const key = keyOf(item);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Array.from(counts, ([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count);
}

function BreakdownBars({
  title,
  items,
  emptyLabel,
  loading,
  accent = "bg-admin-accent",
  limit = 6,
}: {
  title: string;
  items: { label: string; count: number; href?: string }[];
  emptyLabel: string;
  loading: boolean;
  accent?: string;
  limit?: number;
}) {
  const max = Math.max(...items.map((i) => i.count), 1);
  const rows = items.slice(0, limit);
  return (
    <motion.div variants={fadeUp} className="rounded-3xl bg-admin-surface p-5 shadow-soft">
      <h4 className="font-display text-sm font-semibold text-admin-text">{title}</h4>
      {loading ? (
        <div className="mt-4 space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i}>
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="mt-1.5 h-1.5 w-full" />
            </div>
          ))}
        </div>
      ) : rows.length === 0 ? (
        <p className="mt-3 text-sm text-admin-text-dim">{emptyLabel}</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {rows.map((item, i) => {
            const row = (
              <>
                <div className="flex items-center justify-between text-xs">
                  <span className="truncate text-admin-text">{item.label}</span>
                  <span className="shrink-0 font-semibold text-admin-text-dim">
                    <CountUp value={item.count} />
                  </span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-admin-bg">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.count / max) * 100}%` }}
                    transition={{ duration: 0.6, delay: 0.1 + i * 0.05, ease: easeOut }}
                    className={`h-full rounded-full ${accent}`}
                  />
                </div>
              </>
            );
            return (
              <li key={item.label}>
                {item.href ? (
                  <Link href={item.href} className="block rounded-lg transition-opacity hover:opacity-70">
                    {row}
                  </Link>
                ) : (
                  row
                )}
              </li>
            );
          })}
        </ul>
      )}
    </motion.div>
  );
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function formatFCFA(value: number) {
  return `${value.toLocaleString("fr-FR")} FCFA`;
}

/** Builds a smooth line through points using quadratic-bezier midpoints. */
function smoothPath(points: { x: number; y: number }[]) {
  if (points.length < 2) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const mx = (p0.x + p1.x) / 2;
    const my = (p0.y + p1.y) / 2;
    d += ` Q ${p0.x} ${p0.y} ${mx} ${my}`;
  }
  const last = points[points.length - 1];
  d += ` T ${last.x} ${last.y}`;
  return d;
}

function VisitChart({ data }: { data: VisitPoint[] }) {
  if (data.length === 0) {
    return <p className="mt-4 text-sm text-admin-text-dim">Pas encore de données de visite.</p>;
  }
  const max = Math.max(...data.map((d) => d.count), 1);
  const width = 640;
  const height = 160;
  const stepX = data.length > 1 ? width / (data.length - 1) : 0;

  const points = data.map((d, i) => ({ x: i * stepX, y: height - (d.count / max) * height, raw: d }));
  const linePath = smoothPath(points);
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height + 24}`} className="mt-4 w-full overflow-visible" role="img" aria-label="Visites des 30 derniers jours">
      <defs>
        <linearGradient id="visit-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a8791a" stopOpacity={0.35} />
          <stop offset="100%" stopColor="#a8791a" stopOpacity={0} />
        </linearGradient>
      </defs>

      <motion.path
        d={areaPath}
        fill="url(#visit-gradient)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      />
      <motion.path
        d={linePath}
        fill="none"
        strokeWidth={2}
        className="stroke-gold-dark"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.1, ease: easeOut }}
      />

      {points.map((p, i) => {
        const label = new Date(p.raw.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
        return (
          <g key={p.raw.date}>
            <circle cx={p.x} cy={p.y} r={6} className="fill-transparent" />
            <motion.circle
              cx={p.x}
              cy={p.y}
              r={2.5}
              className="fill-gold-dark transition-[r] hover:r-[5px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 + i * 0.015 }}
            >
              <title>{`${label} : ${p.raw.count} visite${p.raw.count > 1 ? "s" : ""}`}</title>
            </motion.circle>
            {(i === 0 || i === points.length - 1) && (
              <text x={p.x} y={height + 16} fontSize="9" textAnchor={i === 0 ? "start" : "end"} className="fill-admin-text-dim">
                {label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function CategoryBars({
  items,
  loading,
}: {
  items: { label: string; count: number; color: string }[];
  loading: boolean;
}) {
  const max = Math.max(...items.map((i) => i.count), 1);
  const hasData = items.some((i) => i.count > 0);
  return (
    <motion.div variants={fadeUp} className="rounded-3xl bg-admin-surface p-5 shadow-soft">
      <h4 className="font-display text-sm font-semibold text-admin-text">Biens par catégorie</h4>
      {loading ? (
        <div className="mt-4 space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i}>
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="mt-1.5 h-1.5 w-full" />
            </div>
          ))}
        </div>
      ) : !hasData ? (
        <p className="mt-3 text-sm text-admin-text-dim">Aucun bien publié pour le moment.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {items.map((item, i) => (
            <li key={item.label}>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-admin-text">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.label}
                </span>
                <span className="shrink-0 font-semibold text-admin-text-dim">
                  <CountUp value={item.count} />
                </span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-admin-bg">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.count / max) * 100}%` }}
                  transition={{ duration: 0.6, delay: 0.1 + i * 0.05, ease: easeOut }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: item.color }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}

function OccupancyGauge({
  occupied,
  vacant,
  loading,
}: {
  occupied: number;
  vacant: number;
  loading: boolean;
}) {
  const total = occupied + vacant;
  const occupiedPct = total > 0 ? (occupied / total) * 100 : 0;
  return (
    <motion.div variants={fadeUp} className="rounded-3xl bg-admin-surface p-5 shadow-soft">
      <h4 className="font-display text-sm font-semibold text-admin-text">Occupation des biens en location</h4>
      {loading ? (
        <Skeleton className="mt-4 h-8 w-full" />
      ) : total === 0 ? (
        <p className="mt-3 text-sm text-admin-text-dim">Aucun bien en location pour le moment.</p>
      ) : (
        <>
          <div className="mt-4 flex h-8 w-full overflow-hidden rounded-full bg-admin-bg">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${occupiedPct}%` }}
              transition={{ duration: 0.8, ease: easeOut }}
              className="h-full"
              style={{ backgroundColor: "#0ca30c" }}
            />
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${100 - occupiedPct}%` }}
              transition={{ duration: 0.8, ease: easeOut, delay: 0.1 }}
              className="h-full"
              style={{ backgroundColor: "#fab219" }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-admin-text-dim">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "#0ca30c" }} />
              Occupés — <CountUp value={occupied} />
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "#fab219" }} />
              Libres — <CountUp value={vacant} />
            </span>
          </div>
        </>
      )}
    </motion.div>
  );
}

function TenantList({
  items,
  loading,
}: {
  items: { id: number; property: string; tenant: string }[];
  loading: boolean;
}) {
  return (
    <motion.div variants={fadeUp} className="rounded-3xl bg-admin-surface p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <h4 className="font-display text-sm font-semibold text-admin-text">Locataires actuels</h4>
        <Link href="/admin/properties" className="text-xs font-semibold text-admin-accent hover:underline">
          Gérer
        </Link>
      </div>
      {loading ? (
        <div className="mt-3 space-y-2.5">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="mt-3 text-sm text-admin-text-dim">Aucun locataire enregistré pour le moment.</p>
      ) : (
        <ul className="mt-3 space-y-2.5">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-2 text-sm">
              <span className="truncate text-admin-text">{item.property}</span>
              <span className="shrink-0 text-xs text-admin-text-dim">{item.tenant}</span>
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}

function PreviewColumn({
  title,
  href,
  emptyLabel,
  items,
  loading,
}: {
  title: string;
  href: string;
  emptyLabel: string;
  items: { id: number; title: string; subtitle: string; snippet: string; date: string }[];
  loading: boolean;
}) {
  return (
    <motion.div variants={fadeUp} className="rounded-3xl bg-admin-surface p-5 shadow-soft transition-shadow hover:shadow-soft-lg">
      <div className="flex items-center justify-between">
        <h4 className="font-display text-sm font-semibold text-admin-text">{title}</h4>
        <Link href={href} className="text-xs font-semibold text-admin-accent hover:underline">
          Voir tout
        </Link>
      </div>
      {loading ? (
        <div className="mt-3 space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-1.5 px-2 py-1.5">
              <Skeleton className="h-3.5 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
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
    </motion.div>
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
  const [unreadVisitRequests, setUnreadVisitRequests] = useState<PreviewVisitRequest[]>([]);
  const [quotesByDepartment, setQuotesByDepartment] = useState<{ label: string; count: number }[]>([]);
  const [visitsByProperty, setVisitsByProperty] = useState<{ label: string; count: number }[]>([]);
  const [properties, setProperties] = useState<AdminProperty[] | null>(null);
  const isFull = role === "full";

  const publishedProperties = properties?.filter((p) => p.is_published !== false) ?? [];
  const propertiesByCategory = (Object.keys(PROPERTY_CATEGORY_LABELS) as AdminProperty["category"][]).map(
    (cat, i) => ({
      label: PROPERTY_CATEGORY_LABELS[cat],
      count: publishedProperties.filter((p) => p.category === cat).length,
      color: CATEGORY_COLORS[i],
    })
  );
  const rentals = publishedProperties.filter((p) => p.transaction_type === "location");
  const occupiedCount = rentals.filter((p) => p.is_occupied).length;
  const vacantCount = rentals.length - occupiedCount;
  const mostExpensive = publishedProperties
    .filter((p) => p.price_amount != null)
    .sort((a, b) => (b.price_amount ?? 0) - (a.price_amount ?? 0))[0];
  const tenants = rentals
    .filter((p) => p.is_occupied && p.tenant_name)
    .map((p) => ({ id: p.id, property: p.title_fr, tenant: p.tenant_name }));
  const monthlyRevenue = rentals
    .filter((p) => p.is_occupied && p.price_amount != null)
    .reduce((sum, p) => sum + (p.price_amount ?? 0), 0);
  const annualRevenue = monthlyRevenue * 12;

  const contentBars = counts
    ? CONTENT_BARS.map((c) => ({ label: c.label, count: counts[c.key], href: c.href })).sort(
        (a, b) => b.count - a.count
      )
    : [];
  const requestBars = counts
    ? REQUEST_BARS.map((c) => ({ label: c.label, count: counts[c.key], href: c.href })).sort(
        (a, b) => b.count - a.count
      )
    : [];
  const totalContent = counts ? CONTENT_BARS.reduce((sum, c) => sum + counts[c.key], 0) : 0;
  const totalUnread = counts ? REQUEST_BARS.reduce((sum, c) => sum + counts[c.key], 0) : 0;

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
        visitRequests,
        settings,
      ] = await Promise.all([
        adminApi.list<{ is_published?: boolean }>("departments").catch(() => []),
        adminApi.list<AdminProperty>("properties").catch(() => []),
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
        adminApi.list<PreviewVisitRequest>("property-visit-requests").catch(() => []),
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
        unreadVisitRequests: visitRequests.filter((v) => !v.is_read).length,
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
      setProperties(properties);

      setUnreadMessages(messages.filter((m) => !m.is_read).slice(0, 3));
      setUnreadApplications(applications.filter((a) => !a.is_read).slice(0, 3));
      setUnreadQuotes(quotes.filter((q) => !q.is_read).slice(0, 3));
      setUnreadVisitRequests(visitRequests.filter((v) => !v.is_read).slice(0, 3));

      setQuotesByDepartment(groupAndCount(quotes, (q) => q.department_title || "Devis général"));
      setVisitsByProperty(groupAndCount(visitRequests, (v) => v.property_title || "Bien supprimé"));

      const stats30 = await adminApi.list<VisitPoint>("visit-stats").catch(() => []);
      setVisits(stats30);
    })();
  }, []);

  const draftsWithContent = draftCounts
    ? DRAFT_RESOURCES.filter((r) => (draftCounts[r.key] ?? 0) > 0)
    : [];

  return (
    <motion.div initial="hidden" animate="show" variants={stagger}>
      <motion.div variants={fadeUp}>
        <h2 className="font-display text-xl font-semibold text-admin-text">Tableau de bord</h2>
        <p className="mt-1 text-sm text-admin-text-dim">Vue d&apos;ensemble du contenu du site KANYEL SARL.</p>
      </motion.div>

      {isFull && (
        <motion.div variants={fadeUp} className="mt-6 flex flex-wrap gap-3">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="rounded-full bg-admin-accent px-4 py-2 text-xs font-semibold text-admin-accent-text shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-soft-lg"
            >
              {action.label}
            </Link>
          ))}
        </motion.div>
      )}

      {isFull && draftsWithContent.length > 0 && (
        <motion.div variants={fadeUp} className="mt-6 rounded-3xl bg-gold-soft p-5 admin-dark:bg-gold-dark/15">
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
        </motion.div>
      )}

      <motion.div variants={stagger} className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <motion.div
          variants={fadeUp}
          className="rounded-3xl bg-gradient-to-br from-admin-accent to-admin-accent/80 p-5 text-admin-accent-text shadow-soft"
        >
          <p className="font-display text-4xl font-semibold">
            {counts ? <CountUp value={counts.visitCount} /> : <Skeleton className="h-9 w-16 bg-white/20" />}
          </p>
          <p className="mt-1 text-sm text-admin-accent-text/80">Visiteurs du site</p>
        </motion.div>

        <motion.div variants={fadeUp} className="rounded-3xl bg-admin-surface p-5 shadow-soft">
          <p className="font-display text-4xl font-semibold text-gold-dark">
            {counts ? <CountUp value={totalUnread} /> : <Skeleton className="h-9 w-16" />}
          </p>
          <p className="mt-1 text-sm text-admin-text-dim">Demandes non lues</p>
        </motion.div>

        {isFull && (
          <motion.div variants={fadeUp} className="rounded-3xl bg-admin-surface p-5 shadow-soft">
            <p className="font-display text-4xl font-semibold text-admin-text">
              {counts ? <CountUp value={totalContent} /> : <Skeleton className="h-9 w-16" />}
            </p>
            <p className="mt-1 text-sm text-admin-text-dim">Éléments de contenu publiés</p>
          </motion.div>
        )}
      </motion.div>

      <motion.div variants={stagger} className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <BreakdownBars
          title="Demandes à traiter"
          items={requestBars}
          emptyLabel="Aucune demande à traiter."
          loading={counts === null}
          accent="bg-gold-dark"
          limit={4}
        />
        {isFull && (
          <BreakdownBars
            title="Contenu par catégorie"
            items={contentBars}
            emptyLabel="Aucun contenu publié pour le moment."
            loading={counts === null}
            limit={11}
          />
        )}
      </motion.div>

      {isFull && (
        <>
          <motion.h3 variants={fadeUp} className="mt-10 font-display text-base font-semibold text-admin-text">
            Immobilier
          </motion.h3>

          <motion.div variants={stagger} className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <motion.div variants={fadeUp} className="rounded-3xl bg-admin-surface p-5 shadow-soft">
              <p className="truncate font-display text-lg font-semibold text-admin-text">
                {properties === null ? (
                  <Skeleton className="h-6 w-32" />
                ) : mostExpensive ? (
                  formatFCFA(mostExpensive.price_amount ?? 0)
                ) : (
                  "—"
                )}
              </p>
              <p className="mt-1 truncate text-sm text-admin-text-dim">
                Bien le plus cher{mostExpensive ? ` — ${mostExpensive.title_fr}` : ""}
              </p>
            </motion.div>
            <motion.div variants={fadeUp} className="rounded-3xl bg-admin-surface p-5 shadow-soft">
              <p className="font-display text-2xl font-semibold text-admin-text">
                {properties === null ? <Skeleton className="h-7 w-28" /> : formatFCFA(monthlyRevenue)}
              </p>
              <p className="mt-1 text-sm text-admin-text-dim">Revenu locatif mensuel (biens occupés)</p>
            </motion.div>
            <motion.div variants={fadeUp} className="rounded-3xl bg-admin-surface p-5 shadow-soft">
              <p className="font-display text-2xl font-semibold text-admin-text">
                {properties === null ? <Skeleton className="h-7 w-28" /> : formatFCFA(annualRevenue)}
              </p>
              <p className="mt-1 text-sm text-admin-text-dim">Projection annuelle (× 12)</p>
            </motion.div>
          </motion.div>

          <motion.div variants={stagger} className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <CategoryBars items={propertiesByCategory} loading={properties === null} />
            <OccupancyGauge occupied={occupiedCount} vacant={vacantCount} loading={properties === null} />
            <TenantList items={tenants} loading={properties === null} />
          </motion.div>
        </>
      )}

      <motion.div variants={stagger} className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <PreviewColumn
          title="Derniers messages non lus"
          href="/admin/messages"
          emptyLabel="Aucun message non lu."
          loading={counts === null}
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
          loading={counts === null}
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
          loading={counts === null}
          items={unreadQuotes.map((q) => ({
            id: q.id,
            title: q.full_name,
            subtitle: q.department_title || "Devis général",
            snippet: q.description,
            date: formatDateTime(q.created_at),
          }))}
        />
        <PreviewColumn
          title="Dernières demandes de visite non lues"
          href="/admin/property-visit-requests"
          emptyLabel="Aucune demande de visite non lue."
          loading={counts === null}
          items={unreadVisitRequests.map((v) => ({
            id: v.id,
            title: v.full_name,
            subtitle: v.property_title || "Bien supprimé",
            snippet: v.message,
            date: formatDateTime(v.created_at),
          }))}
        />
      </motion.div>

      <motion.div variants={stagger} className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <BreakdownBars
          title="Demandes de devis par activité"
          items={quotesByDepartment}
          emptyLabel="Aucune demande de devis reçue pour le moment."
          loading={counts === null}
        />
        <BreakdownBars
          title="Biens les plus demandés en visite"
          items={visitsByProperty}
          emptyLabel="Aucune demande de visite reçue pour le moment."
          loading={counts === null}
        />
      </motion.div>

      <motion.div variants={fadeUp} className="mt-8 rounded-3xl bg-admin-surface p-6 shadow-soft">
        <h3 className="font-display text-base font-semibold text-admin-text">Visites des 30 derniers jours</h3>
        {visits === null ? (
          <Skeleton className="mt-4 h-40 w-full" />
        ) : (
          <VisitChart data={visits} />
        )}
      </motion.div>
    </motion.div>
  );
}
