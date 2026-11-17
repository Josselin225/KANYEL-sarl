# Généré par Django 6.1.1 le2026-11-17 15:01

import content.validators
import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('content', '0026_property_is_occupied_property_price_amount_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='jobapplication',
            name='cover_letter',
            field=models.FileField(blank=True, null=True, upload_to=content.validators.cover_letter_upload_path, validators=[content.validators.validate_document_size, django.core.validators.FileExtensionValidator(['pdf', 'doc', 'docx']), content.validators.validate_document_content], verbose_name='Lettre de motivation'),
        ),
        migrations.AlterField(
            model_name='jobapplication',
            name='cv',
            field=models.FileField(upload_to=content.validators.cv_upload_path, validators=[content.validators.validate_document_size, django.core.validators.FileExtensionValidator(['pdf', 'doc', 'docx']), content.validators.validate_document_content], verbose_name='CV'),
        ),
    ]
