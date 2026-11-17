import os
from io import BytesIO

from django.core.files.uploadedfile import InMemoryUploadedFile
from PIL import Image, ImageOps

MAX_DIMENSION = 1920
JPEG_QUALITY = 82


def compress_image(uploaded_file):
    """Réduit et réencode une image uploadée pour qu'elle ne reste pas sur disque (ni servie
    à chaque visiteur) dans sa résolution d'appareil photo d'origine de plusieurs Mo."""
    image = Image.open(uploaded_file)
    image = ImageOps.exif_transpose(image)

    if image.width > MAX_DIMENSION or image.height > MAX_DIMENSION:
        image.thumbnail((MAX_DIMENSION, MAX_DIMENSION), Image.LANCZOS)

    has_alpha = image.mode in ("RGBA", "LA") or (image.mode == "P" and "transparency" in image.info)
    output = BytesIO()
    if has_alpha:
        image.save(output, format="PNG", optimize=True)
        content_type = "image/png"
        extension = ".png"
    else:
        image = image.convert("RGB")
        image.save(output, format="JPEG", quality=JPEG_QUALITY, optimize=True)
        content_type = "image/jpeg"
        extension = ".jpg"
    output.seek(0)

    name = os.path.splitext(uploaded_file.name)[0] + extension
    return InMemoryUploadedFile(output, "ImageField", name, content_type, output.getbuffer().nbytes, None)


class CompressImagesMixin:
    """Compresse automatiquement chaque champ listé dans `image_fields` à l'enregistrement. Ne
    s'applique qu'aux nouveaux uploads (pas aux fichiers déjà enregistrés, réenregistrés pour un autre champ)."""

    image_fields: list[str] = []

    def save(self, *args, **kwargs):
        for field_name in self.image_fields:
            field_file = getattr(self, field_name, None)
            if field_file and hasattr(field_file, "file") and not field_file._committed:
                compressed = compress_image(field_file.file)
                field_file.save(compressed.name, compressed, save=False)
        super().save(*args, **kwargs)
