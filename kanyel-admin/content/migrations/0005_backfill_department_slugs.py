from django.db import migrations
from django.utils.text import slugify


def backfill_slugs(apps, schema_editor):
    Department = apps.get_model("content", "Department")
    seen = set()
    for dept in Department.objects.all().order_by("order", "id"):
        base = slugify(dept.title_fr) or "activite"
        slug = base
        i = 2
        while slug in seen or Department.objects.exclude(pk=dept.pk).filter(slug=slug).exists():
            slug = f"{base}-{i}"
            i += 1
        seen.add(slug)
        dept.slug = slug
        dept.save(update_fields=["slug"])


def noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("content", "0004_property_department_detail_content_en_and_more"),
    ]

    operations = [
        migrations.RunPython(backfill_slugs, noop),
    ]
