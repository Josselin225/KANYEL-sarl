import ResourceCrud from "@/components/admin/ResourceCrud";
import { JOB_OFFERS_RESOURCE } from "@/lib/adminResources";

export default function AdminJobsPage() {
  return <ResourceCrud resource={JOB_OFFERS_RESOURCE} />;
}
