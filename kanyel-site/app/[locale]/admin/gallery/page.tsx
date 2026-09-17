import ResourceCrud from "@/components/admin/ResourceCrud";
import { GALLERY_RESOURCE } from "@/lib/adminResources";

export default function AdminGalleryPage() {
  return <ResourceCrud resource={GALLERY_RESOURCE} />;
}
