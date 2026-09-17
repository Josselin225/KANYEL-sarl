from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("content", "0005_backfill_department_slugs"),
    ]

    operations = [
        migrations.AlterField(
            model_name="department",
            name="slug",
            field=models.SlugField(blank=True, max_length=220, unique=True, verbose_name="Identifiant URL (slug)"),
        ),
    ]
