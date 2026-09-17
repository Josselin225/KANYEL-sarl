"""Backs up the SQLite database and uploaded media into a single timestamped
zip archive, then deletes archives older than 30 days.

Run manually with:  python manage.py backup_data
Intended to run daily via a Windows Scheduled Task (see docs/BACKUP.md).
"""

import time
import zipfile
from datetime import datetime
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand

RETENTION_DAYS = 30


class Command(BaseCommand):
    help = "Zips the database and media folder into backups/, pruning archives older than 30 days."

    def handle(self, *args, **options):
        backups_dir = Path(settings.BASE_DIR) / "backups"
        backups_dir.mkdir(exist_ok=True)

        timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        archive_path = backups_dir / f"kanyel-backup-{timestamp}.zip"

        db_path = Path(settings.DATABASES["default"]["NAME"])
        media_root = Path(settings.MEDIA_ROOT)

        with zipfile.ZipFile(archive_path, "w", zipfile.ZIP_DEFLATED) as zf:
            if db_path.exists():
                zf.write(db_path, arcname=db_path.name)
            if media_root.exists():
                for file_path in media_root.rglob("*"):
                    if file_path.is_file():
                        zf.write(file_path, arcname=str(Path("media") / file_path.relative_to(media_root)))

        self.stdout.write(self.style.SUCCESS(f"Backup created: {archive_path}"))

        cutoff = time.time() - RETENTION_DAYS * 86400
        for old_archive in backups_dir.glob("kanyel-backup-*.zip"):
            if old_archive.stat().st_mtime < cutoff:
                old_archive.unlink()
                self.stdout.write(f"Removed old backup: {old_archive.name}")
