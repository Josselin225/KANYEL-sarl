"""Déchiffre une sauvegarde produite par backup_data en un simple .zip.

    python manage.py decrypt_backup backups/kanyel-backup-<date>.zip.enc [output.zip]

Chiffre aussi, en option, les anciennes sauvegardes en clair sur place :

    python manage.py decrypt_backup --encrypt-legacy
"""

from pathlib import Path

from cryptography.exceptions import InvalidTag
from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

from content.backup_crypto import BackupKeyError, decrypt_file, encrypt_file, load_key


class Command(BaseCommand):
    help = "Decrypts an encrypted backup (.zip.enc) into a .zip."

    def add_arguments(self, parser):
        parser.add_argument("source", nargs="?")
        parser.add_argument("output", nargs="?")
        parser.add_argument(
            "--encrypt-legacy", action="store_true",
            help="Encrypt every unencrypted backups/*.zip and delete the plaintext original.",
        )

    def handle(self, *args, source=None, output=None, encrypt_legacy=False, **options):
        try:
            key = load_key()
        except BackupKeyError as exc:
            raise CommandError(str(exc))

        if encrypt_legacy:
            backups_dir = Path(settings.BASE_DIR) / "backups"
            for plain in sorted(backups_dir.glob("kanyel-backup-*.zip")):
                target = plain.with_name(plain.name + ".enc")
                encrypt_file(plain, target, key)
                plain.unlink()
                self.stdout.write(f"Encrypted: {target.name}")
            return

        if not source:
            raise CommandError("Indiquez le fichier .zip.enc à déchiffrer.")
        src = Path(source)
        dst = Path(output) if output else src.with_suffix("")  # retire ".enc"
        if dst.exists():
            raise CommandError(f"{dst} existe déjà.")
        try:
            decrypt_file(src, dst, key)
        except (InvalidTag, ValueError) as exc:
            dst.unlink(missing_ok=True)
            raise CommandError(f"Déchiffrement impossible (mauvaise clé ou fichier altéré). {exc}")
        self.stdout.write(self.style.SUCCESS(f"Decrypted to: {dst}"))
