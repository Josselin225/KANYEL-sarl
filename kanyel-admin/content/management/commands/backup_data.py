"""Backs up the SQLite database and uploaded media into a single timestamped,
AES-256-GCM encrypted archive (.zip.enc), then deletes archives older than
30 days. The key is BACKUP_ENCRYPTION_KEY in .env — keep a copy of it
somewhere safe outside the server, or the backups can't be restored.

Run manually with:  python manage.py backup_data
Restore with:       python manage.py decrypt_backup backups/<file>.zip.enc
Intended to run daily via a Windows Scheduled Task (see docs/BACKUP.md).
"""

import sqlite3
from contextlib import closing
import tempfile
import time
import zipfile
from datetime import datetime
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

from content.backup_crypto import BackupKeyError, encrypt_file, load_key

RETENTION_DAYS = 30


class Command(BaseCommand):
    help = "Zips and encrypts the database and media folder into backups/, pruning archives older than 30 days."

    def handle(self, *args, **options):
        try:
            key = load_key()
        except BackupKeyError as exc:
            # Fail closed: never write an unencrypted backup.
            raise CommandError(str(exc))

        backups_dir = Path(settings.BASE_DIR) / "backups"
        backups_dir.mkdir(exist_ok=True)

        timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        archive_path = backups_dir / f"kanyel-backup-{timestamp}.zip.enc"

        db_path = Path(settings.DATABASES["default"]["NAME"])
        media_root = Path(settings.MEDIA_ROOT)

        # Plaintext only ever exists in the OS temp dir, and is removed right after.
        with tempfile.TemporaryDirectory() as tmp:
            zip_path = Path(tmp) / "backup.zip"
            with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
                if db_path.exists():
                    # Consistent snapshot even if the site is writing meanwhile.
                    snapshot = Path(tmp) / db_path.name
                    with closing(sqlite3.connect(db_path)) as src, closing(sqlite3.connect(snapshot)) as dst:
                        src.backup(dst)
                    zf.write(snapshot, arcname=db_path.name)
                if media_root.exists():
                    for file_path in media_root.rglob("*"):
                        if file_path.is_file():
                            zf.write(file_path, arcname=str(Path("media") / file_path.relative_to(media_root)))
            encrypt_file(zip_path, archive_path, key)

        self.stdout.write(self.style.SUCCESS(f"Backup created (encrypted): {archive_path}"))

        cutoff = time.time() - RETENTION_DAYS * 86400
        for old_archive in backups_dir.glob("kanyel-backup-*"):
            if old_archive.stat().st_mtime < cutoff:
                old_archive.unlink()
                self.stdout.write(f"Removed old backup: {old_archive.name}")
