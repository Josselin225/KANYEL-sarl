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
  { href: "/admin/realisations", label: "Nos réalisations", icon: "star" },
  { href: "/admin/realisation-images", label: "Galerie des réalisations", icon: "gallery" },
  { href: "/admin/articles", label: "Actualités", icon: "news" },
  { href: "/admin/faqs", label: "Questions fréquentes", icon: "help" },
  { href: "/admin/quote-requests", label: "Demandes de devis", icon: "invoice" },
  { href: "/admin/messages", label: "Messages", icon: "mail" },
  { href: "/admin/settings", label: "Paramètres du site", icon: "settings" },
];
