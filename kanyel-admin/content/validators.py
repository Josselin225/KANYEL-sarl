import os
import uuid
import zipfile

from django.core.exceptions import ValidationError

MAX_IMAGE_SIZE = 8 * 1024 * 1024  # 8 Mo
MAX_DOCUMENT_SIZE = 5 * 1024 * 1024  # 5 Mo

# Octets de tête par lesquels chaque type de document accepté doit commencer.
_DOCUMENT_SIGNATURES = {
    ".pdf": [b"%PDF-"],
    ".docx": [b"PK\x03\x04"],
    ".doc": [b"\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1"],
}
# Marqueurs de contenu actif (macros, scripts, lancement auto) dont un CV n'a jamais besoin.
_PDF_ACTIVE_MARKERS = [b"/JavaScript", b"/Launch", b"/EmbeddedFile"]
_OLE_MACRO_MARKER = "_VBA_PROJECT".encode("utf-16-le")


def validate_image_size(file):
    if file.size > MAX_IMAGE_SIZE:
        raise ValidationError("L'image ne doit pas dépasser 8 Mo.")


def validate_document_size(file):
    if file.size > MAX_DOCUMENT_SIZE:
        raise ValidationError("Le fichier ne doit pas dépasser 5 Mo.")


def validate_document_content(file):
    """Vérifie que le fichier est bien le document PDF/Word annoncé par son extension,
    et rejette les documents contenant des macros ou des scripts intégrés."""
    ext = os.path.splitext(file.name)[1].lower()
    signatures = _DOCUMENT_SIGNATURES.get(ext)
    if signatures is None:
        raise ValidationError("Format de fichier non pris en charge.")

    file.seek(0)
    data = file.read()
    file.seek(0)

    if not any(data.startswith(sig) for sig in signatures):
        raise ValidationError("Le contenu du fichier ne correspond pas à son extension.")

    if ext == ".pdf" and any(marker in data for marker in _PDF_ACTIVE_MARKERS):
        raise ValidationError("Ce PDF contient du contenu actif (scripts) et ne peut pas être accepté.")

    if ext == ".doc" and _OLE_MACRO_MARKER in data:
        raise ValidationError("Les documents contenant des macros ne sont pas acceptés.")

    if ext == ".docx":
        try:
            with zipfile.ZipFile(file) as archive:
                names = archive.namelist()
        except zipfile.BadZipFile:
            raise ValidationError("Le document Word est corrompu.")
        finally:
            file.seek(0)
        if "word/document.xml" not in names:
            raise ValidationError("Le contenu du fichier ne correspond pas à son extension.")
        if any(name.lower().endswith("vbaproject.bin") for name in names):
            raise ValidationError("Les documents contenant des macros ne sont pas acceptés.")


def _random_upload_path(folder, filename):
    # Noms aléatoires : l'URL d'un fichier uploadé ne peut pas être devinée
    # à partir du nom de fichier d'origine du candidat.
    ext = os.path.splitext(filename)[1].lower()
    return f"{folder}/{uuid.uuid4().hex}{ext}"


def cv_upload_path(instance, filename):
    return _random_upload_path("applications/cv", filename)


def cover_letter_upload_path(instance, filename):
    return _random_upload_path("applications/cover_letters", filename)
