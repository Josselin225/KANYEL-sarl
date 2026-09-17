export interface AdminNavItem {
  href: string;
  label: string;
  icon: string;
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { href: "/admin", label: "Tableau de bord", icon: "dashboard" },
  { href: "/admin/departments", label: "Nos activités", icon: "layers" },
  { href: "/admin/department-images", label: "Galerie des activités", icon: "gallery" },
  { href: "/admin/properties", label: "Biens immobiliers", icon: "home" },
  { href: "/admin/testimonials", label: "Témoignages", icon: "quote" },
  { href: "/admin/credentials", label: "Reconnaissances", icon: "badge" },
  { href: "/admin/partners", label: "Partenaires", icon: "handshake" },
  { href: "/admin/gallery", label: "Galerie", icon: "image" },
  { href: "/admin/stats", label: "Statistiques clés", icon: "chart" },
  { href: "/admin/jobs", label: "Offres d'emploi", icon: "briefcase" },
  { href: "/admin/job-applications", label: "Candidatures", icon: "user" },
  { href: "/admin/messages", label: "Messages", icon: "mail" },
  { href: "/admin/settings", label: "Paramètres du site", icon: "settings" },
];
