import ResourceCrud from "@/components/admin/ResourceCrud";
import { ARTICLES_RESOURCE } from "@/lib/adminResources";

export default function AdminArticlesPage() {
  return <ResourceCrud resource={ARTICLES_RESOURCE} />;
}
