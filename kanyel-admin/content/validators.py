from django.core.exceptions import ValidationError

MAX_IMAGE_SIZE = 8 * 1024 * 1024  # 8 MB
MAX_DOCUMENT_SIZE = 5 * 1024 * 1024  # 5 MB


def validate_image_size(file):
    if file.size > MAX_IMAGE_SIZE:
        raise ValidationError("L'image ne doit pas dépasser 8 Mo.")


def validate_document_size(file):
    if file.size > MAX_DOCUMENT_SIZE:
        raise ValidationError("Le fichier ne doit pas dépasser 5 Mo.")
