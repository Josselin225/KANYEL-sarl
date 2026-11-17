import os
import uuid
import zipfile

from django.core.exceptions import ValidationError

MAX_IMAGE_SIZE = 8 * 1024 * 1024  # 8 MB
MAX_DOCUMENT_SIZE = 5 * 1024 * 1024  # 5 MB

# Leading bytes each accepted document type must start with.
_DOCUMENT_SIGNATURES = {
    ".pdf": [b"%PDF-"],
    ".docx": [b"PK\x03\x04"],
    ".doc": [b"\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1"],
}
# Markers of active content (macros, scripts, auto-launch) a CV never needs.
_PDF_ACTIVE_MARKERS = [b"/JavaScript", b"/Launch", b"/EmbeddedFile"]
_OLE_MACRO_MARKER = "_VBA_PROJECT".encode("utf-16-le")


def validate_image_size(file):
    if file.size > MAX_IMAGE_SIZE:
        raise ValidationError("L'image ne doit pas dépasser 8 Mo.")


def validate_document_size(file):
    if file.size > MAX_DOCUMENT_SIZE:
        raise ValidationError("Le fichier ne doit pas dépasser 5 Mo.")


def validate_document_content(file):
    """Checks the file really is the PDF/Word document its extension claims,
    and rejects documents carrying macros or embedded scripts."""
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
    # Random names: an uploaded file's URL can't be guessed from the
    # applicant's original filename.
    ext = os.path.splitext(filename)[1].lower()
    return f"{folder}/{uuid.uuid4().hex}{ext}"


def cv_upload_path(instance, filename):
    return _random_upload_path("applications/cv", filename)


def cover_letter_upload_path(instance, filename):
    return _random_upload_path("applications/cover_letters", filename)
