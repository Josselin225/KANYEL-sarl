import ResourceCrud from "@/components/admin/ResourceCrud";
import { REALISATION_IMAGES_RESOURCE } from "@/lib/adminResources";

export default function AdminRealisationImagesPage() {
  return <ResourceCrud resource={REALISATION_IMAGES_RESOURCE} />;
}
