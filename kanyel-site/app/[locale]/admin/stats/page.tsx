import ResourceCrud from "@/components/admin/ResourceCrud";
import { STATS_RESOURCE } from "@/lib/adminResources";

export default function AdminStatsPage() {
  return <ResourceCrud resource={STATS_RESOURCE} />;
}
