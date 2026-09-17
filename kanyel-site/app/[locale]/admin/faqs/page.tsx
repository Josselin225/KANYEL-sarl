import ResourceCrud from "@/components/admin/ResourceCrud";
import { FAQS_RESOURCE } from "@/lib/adminResources";

export default function AdminFAQsPage() {
  return <ResourceCrud resource={FAQS_RESOURCE} />;
}
