import ResourceCrud from "@/components/admin/ResourceCrud";
import { DEPARTMENT_IMAGES_RESOURCE } from "@/lib/adminResources";

export default function AdminDepartmentImagesPage() {
  return <ResourceCrud resource={DEPARTMENT_IMAGES_RESOURCE} />;
}
