from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.management.base import BaseCommand

from content.image_processing import compress_image
from content.models import (
    Article,
    Department,
    DepartmentImage,
    GalleryItem,
    Partner,
    Property,
    PropertyImage,
    Realisation,
    RealisationImage,
    SiteSettings,
    Testimonial,
)

# (model, [field names]) pairs — same mapping as each model's `image_fields`.
MODELS_AND_FIELDS = [
    (SiteSettings, ["leader_photo", "hero_image", "about_image"]),
    (Department, ["detail_image"]),
    (DepartmentImage, ["image"]),
    (GalleryItem, ["image"]),
    (Property, ["image"]),
    (PropertyImage, ["image"]),
    (Partner, ["logo"]),
    (Testimonial, ["photo"]),
    (Realisation, ["image"]),
    (RealisationImage, ["image"]),
    (Article, ["cover_image"]),
]

SIZE_THRESHOLD = 500 * 1024  # Only bother re-saving files already reasonably small.


class Command(BaseCommand):
    help = "Re-compresses image files already on disk that predate the automatic upload compression."

    def handle(self, *args, **options):
        total_before = 0
        total_after = 0
        touched = 0

        for model, fields in MODELS_AND_FIELDS:
            for instance in model.objects.all():
                for field_name in fields:
                    field_file = getattr(instance, field_name, None)
                    if not field_file or not field_file.name:
                        continue
                    try:
                        size_before = field_file.size
                    except (FileNotFoundError, OSError):
                        self.stderr.write(f"Missing file for {model.__name__}#{instance.pk}.{field_name}")
                        continue
                    if size_before <= SIZE_THRESHOLD:
                        continue

                    with field_file.open("rb") as f:
                        content = f.read()
                    upload = SimpleUploadedFile(field_file.name.rsplit("/", 1)[-1], content)
                    compressed = compress_image(upload)

                    old_name = field_file.name
                    field_file.storage.delete(old_name)
                    field_file.save(compressed.name, compressed, save=False)
                    instance.save(update_fields=[field_name])

                    size_after = compressed.size
                    total_before += size_before
                    total_after += size_after
                    touched += 1
                    self.stdout.write(
                        f"{model.__name__}#{instance.pk}.{field_name}: "
                        f"{size_before / 1024:.0f} Ko -> {size_after / 1024:.0f} Ko"
                    )

        self.stdout.write(self.style.SUCCESS(
            f"\n{touched} fichier(s) compressé(s) — "
            f"{total_before / 1024 / 1024:.1f} Mo -> {total_after / 1024 / 1024:.1f} Mo"
        ))
