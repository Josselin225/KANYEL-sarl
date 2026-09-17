from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("content", "0017_slogan_en_and_geo"),
    ]

    operations = [
        migrations.RenameField(
            model_name="sitesettings",
            old_name="address",
            new_name="address_fr",
        ),
        migrations.AlterField(
            model_name="sitesettings",
            name="address_fr",
            field=models.CharField(
                default="Nanan, à côté de l'Hôtel Holidays, Yamoussoukro, Côte d'Ivoire",
                max_length=255,
                verbose_name="Adresse (français)",
            ),
        ),
        migrations.AddField(
            model_name="sitesettings",
            name="address_en",
            field=models.CharField(
                default="Nanan, next to the Holidays Hotel, Yamoussoukro, Côte d'Ivoire",
                max_length=255,
                verbose_name="Adresse (anglais)",
            ),
        ),
    ]
