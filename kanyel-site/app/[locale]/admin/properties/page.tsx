import ResourceCrud from "@/components/admin/ResourceCrud";
import { PROPERTIES_RESOURCE } from "@/lib/adminResources";

export default function AdminPropertiesPage() {
  return <ResourceCrud resource={PROPERTIES_RESOURCE} />;
}
