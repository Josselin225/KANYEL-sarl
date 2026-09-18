import type { AdminRole } from "./adminApi";

export interface AdminNavItem {
  href: string;
  label: string;
  icon: string;
  /** Omit to show to every role. Reception accounts only manage messages/applications/quotes. */
  roles?: AdminRole[];
}

export interface AdminNavGroup {
  key: string;
  label: string;
  icon: string;
  items: AdminNavItem[];
}

export const ADMIN_DASHBOARD_ITEM: AdminNavItem = { href: "/admin", label: "Tableau de bord", icon: "dashboard" };

export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    key: "activities",
    label: "Nos activités",
    icon: "layers",
    items: [
      { href: "/admin/departments", label: "Activités", icon: "layers", roles: ["full"] },
      { href: "/admin/department-images", label: "Galerie des activités", icon: "gallery", roles: ["full"] },
    ],
  },
  {
    key: "properties",
    label: "Immobilier",
    icon: "home",
    items: [
      { href: "/admin/properties", label: "Biens immobiliers", icon: "home", roles: ["full"] },
      { href: "/admin/property-images", label: "Galerie des biens", icon: "gallery", roles: ["full"] },
    ],
  },
  {
    key: "content",
    label: "Contenu du site",
    icon: "image",
    items: [
      { href: "/admin/testimonials", label: "Témoignages", icon: "quote", roles: ["full"] },
      { href: "/admin/credentials", label: "Reconnaissances", icon: "badge", roles: ["full"] },
      { href: "/admin/partners", label: "Partenaires", icon: "handshake", roles: ["full"] },
      { href: "/admin/gallery", label: "Galerie", icon: "image", roles: ["full"] },
      { href: "/admin/stats", label: "Statistiques clés", icon: "chart", roles: ["full"] },
    ],
  },
  {
    key: "recruitment",
    label: "Recrutement",
    icon: "briefcase",
    items: [
      { href: "/admin/jobs", label: "Offres d'emploi", icon: "briefcase", roles: ["full"] },
      { href: "/admin/job-applications", label: "Candidatures", icon: "user" },
    ],
  },
  {
    key: "portfolio",
    label: "Réalisations & Actualités",
    icon: "star",
    items: [
      { href: "/admin/realisations", label: "Nos réalisations", icon: "star", roles: ["full"] },
      { href: "/admin/realisation-images", label: "Galerie des réalisations", icon: "gallery", roles: ["full"] },
      { href: "/admin/articles", label: "Actualités", icon: "news", roles: ["full"] },
      { href: "/admin/faqs", label: "Questions fréquentes", icon: "help", roles: ["full"] },
    ],
  },
  {
    key: "requests",
    label: "Demandes clients",
    icon: "mail",
    items: [
      { href: "/admin/quote-requests", label: "Demandes de devis", icon: "invoice" },
      { href: "/admin/messages", label: "Messages", icon: "mail" },
    ],
  },
  {
    key: "admin",
    label: "Administration",
    icon: "settings",
    items: [
      { href: "/admin/users", label: "Comptes admin", icon: "user", roles: ["full"] },
      { href: "/admin/audit-log", label: "Journal d'activité", icon: "log", roles: ["full"] },
      { href: "/admin/settings", label: "Paramètres du site", icon: "settings", roles: ["full"] },
    ],
  },
];

/** Flat list of every nav item (all roles), used where role filtering doesn't matter — e.g. resolving the page title. */
export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  ADMIN_DASHBOARD_ITEM,
  ...ADMIN_NAV_GROUPS.flatMap((g) => g.items),
];

export function visibleNavGroups(role: AdminRole): AdminNavGroup[] {
  return ADMIN_NAV_GROUPS.map((g) => ({ ...g, items: g.items.filter((i) => !i.roles || i.roles.includes(role)) })).filter(
    (g) => g.items.length > 0
  );
}
