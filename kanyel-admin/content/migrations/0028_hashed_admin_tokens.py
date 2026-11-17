# Généré par Django 6.1.1 le2026-11-17 17:24

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


def drop_plaintext_tokens(apps, schema_editor):
    """L'ancienne table rest_framework.authtoken stockait les clés de session en clair ; on la supprime."""
    connection = schema_editor.connection
    if "authtoken_token" in connection.introspection.table_names():
        with connection.cursor() as cursor:
            cursor.execute("DROP TABLE authtoken_token")


class Migration(migrations.Migration):

    dependencies = [
        ('content', '0027_secure_application_uploads'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='AdminToken',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('key_hash', models.CharField(max_length=64, unique=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='admin_tokens', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Session admin',
                'verbose_name_plural': 'Sessions admin',
            },
        ),
        migrations.RunPython(drop_plaintext_tokens, migrations.RunPython.noop),
    ]
