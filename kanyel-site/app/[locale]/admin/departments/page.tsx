import ResourceCrud from "@/components/admin/ResourceCrud";
import { DEPARTMENTS_RESOURCE } from "@/lib/adminResources";

export default function AdminDepartmentsPage() {
  return <ResourceCrud resource={DEPARTMENTS_RESOURCE} />;
}
