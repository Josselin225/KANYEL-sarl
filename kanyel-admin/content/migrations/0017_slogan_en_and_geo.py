from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("content", "0016_alter_contactmessage_phone_and_more"),
    ]

    operations = [
        migrations.RenameField(
            model_name="sitesettings",
            old_name="slogan",
            new_name="slogan_fr",
        ),
        migrations.AlterField(
            model_name="sitesettings",
            name="slogan_fr",
            field=models.CharField(default="La lumière de l'Éternel", max_length=200, verbose_name="Slogan (français)"),
        ),
        migrations.AddField(
            model_name="sitesettings",
            name="slogan_en",
            field=models.CharField(default="The Light of the Eternal", max_length=200, verbose_name="Slogan (anglais)"),
        ),
        migrations.AddField(
            model_name="sitesettings",
            name="latitude",
            field=models.DecimalField(
                blank=True, null=True, max_digits=9, decimal_places=6,
                help_text="Coordonnée GPS pour positionner précisément la carte, ex. 6.827400. Laisser vide pour utiliser l'adresse texte.",
                verbose_name="Latitude",
            ),
        ),
        migrations.AddField(
            model_name="sitesettings",
            name="longitude",
            field=models.DecimalField(
                blank=True, null=True, max_digits=9, decimal_places=6,
                help_text="Coordonnée GPS pour positionner précisément la carte, ex. -5.289400. Laisser vide pour utiliser l'adresse texte.",
                verbose_name="Longitude",
            ),
        ),
    ]
