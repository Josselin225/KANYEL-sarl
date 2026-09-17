import ResourceCrud from "@/components/admin/ResourceCrud";
import { PARTNERS_RESOURCE } from "@/lib/adminResources";

export default function AdminPartnersPage() {
  return <ResourceCrud resource={PARTNERS_RESOURCE} />;
}
