import ResourceCrud from "@/components/admin/ResourceCrud";
import { PROPERTY_IMAGES_RESOURCE } from "@/lib/adminResources";

export default function AdminPropertyImagesPage() {
  return <ResourceCrud resource={PROPERTY_IMAGES_RESOURCE} />;
}
