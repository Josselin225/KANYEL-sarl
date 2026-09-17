export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export type Locale = "fr" | "en";

export type IconKey = "plot" | "building" | "globe" | "truck" | "exchange" | "home" | "box";
export type Accent = "navy" | "gold";
export type ContractType = "cdi" | "cdd" | "stage" | "freelance";
export type PropertyCategory = "villa" | "appartement" | "terrain" | "bureau_commerce" | "immeuble";

export interface ApiSiteSettings {
  id: number;
  company_name: string;
  slogan_fr: string;
  slogan_en: string;
  leader_name: string;
  leader_role_fr: string;
  leader_role_en: string;
  leader_photo: string | null;
  ceo_message_fr: string;
  ceo_message_en: string;
  address_fr: string;
  address_en: string;
  latitude: string | number | null;
  longitude: string | number | null;
  phone_1: string;
  phone_2: string;
  phone_3: string;
  whatsapp_number: string;
  email_main: string;
  email_leader: string;
  website: string;
  facebook_url: string;
  instagram_url: string;
  linkedin_url: string;
  x_url: string;
  tiktok_url: string;
  youtube_url: string;
  hours_fr: string;
  hours_en: string;
  hero_title_fr: string;
  hero_title_en: string;
  hero_subtitle_fr: string;
  hero_subtitle_en: string;
  hero_image: string | null;
  about_paragraph_1_fr: string;
  about_paragraph_1_en: string;
  about_paragraph_2_fr: string;
  about_paragraph_2_en: string;
  about_image: string | null;
  about_image_caption: string;
  visit_count: number;
}

export interface ApiDepartment {
  id: number;
  order: number;
  slug: string;
  icon: IconKey;
  accent: Accent;
  title_fr: string;
  title_en: string;
  description_fr: string;
  description_en: string;
  detail_content_fr: string;
  detail_content_en: string;
  detail_image: string | null;
  has_property_listing: boolean;
  is_published: boolean;
}

export interface ApiDepartmentImage {
  id: number;
  department: string;
  order: number;
  image: string;
  caption_fr: string;
  caption_en: string;
  is_published: boolean;
}

export interface ApiCredential {
  id: number;
  order: number;
  title_fr: string;
  title_en: string;
  description_fr: string;
  description_en: string;
  is_published: boolean;
}

export interface ApiGalleryItem {
  id: number;
  order: number;
  icon: IconKey;
  accent: Accent;
  label_fr: string;
  label_en: string;
  image: string;
  is_published: boolean;
}

export interface ApiProperty {
  id: number;
  order: number;
  category: PropertyCategory;
  title_fr: string;
  title_en: string;
  description_fr: string;
  description_en: string;
  location: string;
  price: string;
  image: string;
  is_published: boolean;
}

export interface ApiTestimonial {
  id: number;
  order: number;
  client_name: string;
  city: string;
  photo: string | null;
  message_fr: string;
  message_en: string;
  is_published: boolean;
}

export interface ApiStat {
  id: number;
  order: number;
  label_fr: string;
  label_en: string;
  value: string;
  is_published: boolean;
}

export interface ApiPartner {
  id: number;
  order: number;
  name: string;
  logo: string;
  website_url: string;
  is_published: boolean;
}

export interface ApiJobOffer {
  id: number;
  order: number;
  title_fr: string;
  title_en: string;
  contract_type: ContractType;
  location: string;
  description_fr: string;
  description_en: string;
  requirements_fr: string;
  requirements_en: string;
  deadline: string | null;
  is_published: boolean;
  created_at: string;
}

async function safeFetchJson<T>(url: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

export async function getSettings(): Promise<ApiSiteSettings | null> {
  return safeFetchJson<ApiSiteSettings | null>(`${API_URL}/api/settings/`, null);
}

export async function getDepartments(): Promise<ApiDepartment[]> {
  return safeFetchJson<ApiDepartment[]>(`${API_URL}/api/departments/`, []);
}

export async function getCredentials(): Promise<ApiCredential[]> {
  return safeFetchJson<ApiCredential[]>(`${API_URL}/api/credentials/`, []);
}

export async function getGallery(): Promise<ApiGalleryItem[]> {
  return safeFetchJson<ApiGalleryItem[]>(`${API_URL}/api/gallery/`, []);
}

export async function getStats(): Promise<ApiStat[]> {
  return safeFetchJson<ApiStat[]>(`${API_URL}/api/stats/`, []);
}

export async function getPartners(): Promise<ApiPartner[]> {
  return safeFetchJson<ApiPartner[]>(`${API_URL}/api/partners/`, []);
}

export async function getProperties(): Promise<ApiProperty[]> {
  return safeFetchJson<ApiProperty[]>(`${API_URL}/api/properties/`, []);
}

export async function getTestimonials(): Promise<ApiTestimonial[]> {
  return safeFetchJson<ApiTestimonial[]>(`${API_URL}/api/testimonials/`, []);
}

export async function getJobOffers(): Promise<ApiJobOffer[]> {
  return safeFetchJson<ApiJobOffer[]>(`${API_URL}/api/jobs/`, []);
}

export async function getDepartmentImages(slug: string): Promise<ApiDepartmentImage[]> {
  const all = await safeFetchJson<ApiDepartmentImage[]>(`${API_URL}/api/department-images/`, []);
  return all.filter((img) => img.department === slug);
}

export interface SiteData {
  settings: ApiSiteSettings | null;
  departments: ApiDepartment[];
  credentials: ApiCredential[];
  gallery: ApiGalleryItem[];
  stats: ApiStat[];
  partners: ApiPartner[];
}

export async function getSiteData(): Promise<SiteData> {
  const [settings, departments, credentials, gallery, stats, partners] = await Promise.all([
    getSettings(),
    getDepartments(),
    getCredentials(),
    getGallery(),
    getStats(),
    getPartners(),
  ]);
  return { settings, departments, credentials, gallery, stats, partners };
}

export async function submitJobApplication(formData: FormData): Promise<void> {
  const res = await fetch(`${API_URL}/api/applications/`, { method: "POST", body: formData });
  if (!res.ok) {
    let message = "Une erreur est survenue lors de l'envoi.";
    try {
      const data = await res.json();
      message = Object.values(data).flat().join(" ") || message;
    } catch {}
    throw new Error(message);
  }
}

export async function incrementVisit(): Promise<void> {
  try {
    await fetch(`${API_URL}/api/visit/`, { method: "POST" });
  } catch {
    // Non-blocking.
  }
}

export function pick<T extends object>(
  obj: T | null | undefined,
  field: string,
  locale: Locale
): string {
  if (!obj) return "";
  const record = obj as unknown as Record<string, unknown>;
  const value = record[`${field}_${locale}`] ?? record[`${field}_fr`];
  return typeof value === "string" ? value : "";
}
