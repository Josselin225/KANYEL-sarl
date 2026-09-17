import ResourceCrud from "@/components/admin/ResourceCrud";
import { REALISATIONS_RESOURCE } from "@/lib/adminResources";

export default function AdminRealisationsPage() {
  return <ResourceCrud resource={REALISATIONS_RESOURCE} />;
}
