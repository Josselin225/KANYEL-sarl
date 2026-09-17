import ResourceCrud from "@/components/admin/ResourceCrud";
import { TESTIMONIALS_RESOURCE } from "@/lib/adminResources";

export default function AdminTestimonialsPage() {
  return <ResourceCrud resource={TESTIMONIALS_RESOURCE} />;
}
