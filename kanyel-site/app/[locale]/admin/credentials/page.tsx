import ResourceCrud from "@/components/admin/ResourceCrud";
import { CREDENTIALS_RESOURCE } from "@/lib/adminResources";

export default function AdminCredentialsPage() {
  return <ResourceCrud resource={CREDENTIALS_RESOURCE} />;
}
