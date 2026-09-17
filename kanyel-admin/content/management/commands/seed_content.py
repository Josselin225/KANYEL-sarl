from pathlib import Path

from django.core.files import File
from django.core.management.base import BaseCommand

from content.models import Credential, Department, GalleryItem, SiteSettings

NEXT_PUBLIC = Path(__file__).resolve().parents[4] / "kanyel-site" / "public" / "images"

DEPARTMENTS = [
    dict(order=1, icon="plot", accent="navy",
         title_fr="Lotissement & Aménagement", title_en="Land Subdivision & Development",
         description_fr="Morcellement, viabilisation et aménagement de terrains, accompagnement dans l'acquisition et la sécurisation foncière pour particuliers, promoteurs et investisseurs.",
         description_en="Land subdivision, servicing, and development, plus support in land acquisition and title security for individuals, developers, and investors."),
    dict(order=2, icon="building", accent="gold",
         title_fr="Bâtiment & Travaux Publics", title_en="Construction & Public Works",
         description_fr="Construction de bâtiments résidentiels, commerciaux et administratifs, ainsi que travaux de voirie et réseaux divers (VRD).",
         description_en="Construction of residential, commercial, and administrative buildings, as well as road works and utility networks (VRD)."),
    dict(order=3, icon="globe", accent="navy",
         title_fr="Import & Export", title_en="Import & Export",
         description_fr="Approvisionnement et commercialisation de marchandises entre la Côte d'Ivoire et les marchés internationaux, avec un réseau de partenaires fiables.",
         description_en="Sourcing and trading of goods between Côte d'Ivoire and international markets, backed by a network of reliable partners."),
    dict(order=4, icon="truck", accent="gold",
         title_fr="Transport & Logistique", title_en="Transport & Logistics",
         description_fr="Organisation du transport de marchandises et gestion logistique, du chargement à la livraison, pour sécuriser chaque étape de la chaîne.",
         description_en="Organization of goods transport and logistics management, from loading to delivery, securing every step of the supply chain."),
    dict(order=5, icon="exchange", accent="navy",
         title_fr="Achats & Ventes", title_en="Buying & Selling",
         description_fr="Négoce et commercialisation de biens et marchandises diverses, avec un service d'intermédiation fiable entre fournisseurs et clients.",
         description_en="Trading and marketing of various goods, with a reliable intermediation service between suppliers and clients."),
]

CREDENTIALS = [
    dict(order=1,
         title_fr="Vice-Président — HPCO-CI", title_en="Vice-President — HPCO-CI",
         description_fr="Haut Patronat des Commerçants et Opérateurs Économiques de Côte d'Ivoire — Délégué Départemental de la ville de Yamoussoukro.",
         description_en="High Patronage of Traders and Economic Operators of Côte d'Ivoire — Departmental Delegate for the city of Yamoussoukro."),
    dict(order=2,
         title_fr="Gouverneur Territorial — RIHDE", title_en="Territorial Governor — RIHDE",
         description_fr="Réseau International Humanitaire Pour le Développement Équitable — « Un monde juste et équitable ».",
         description_en="International Humanitarian Network for Equitable Development — \"A Just and Equitable World.\""),
    dict(order=3,
         title_fr="Représentant exclusif — Certification ISO", title_en="Exclusive Representative — ISO Certification",
         description_fr="Un engagement affirmé pour la qualité et les standards internationaux dans la conduite des activités du groupe.",
         description_en="A firm commitment to quality and international standards across the group's activities."),
]

GALLERY = [
    dict(order=1, icon="plot", accent="navy", file="gallery/lotissement.jpg",
         label_fr="Lotissements & terrains viabilisés", label_en="Subdivisions & serviced land"),
    dict(order=2, icon="building", accent="gold", file="gallery/btp.jpg",
         label_fr="Chantiers BTP & VRD", label_en="Construction & public works sites"),
    dict(order=3, icon="globe", accent="navy", file="gallery/import-export.jpg",
         label_fr="Conteneurs import-export", label_en="Import-export containers"),
    dict(order=4, icon="truck", accent="gold", file="gallery/transport.jpg",
         label_fr="Flotte transport & logistique", label_en="Transport & logistics fleet"),
    dict(order=5, icon="home", accent="navy", file="gallery/immobilier.jpg",
         label_fr="Biens immobiliers", label_en="Real estate properties"),
    dict(order=6, icon="box", accent="gold", file="gallery/negoce.jpg",
         label_fr="Marchandises & négoce", label_en="Goods & trading"),
]


class Command(BaseCommand):
    help = "Seed the database with the site's current content (idempotent)."

    def handle(self, *args, **options):
        self.seed_settings()
        self.seed_departments()
        self.seed_credentials()
        self.seed_gallery()
        self.stdout.write(self.style.SUCCESS("Contenu initial chargé avec succès."))

    def seed_settings(self):
        if SiteSettings.objects.exists():
            self.stdout.write("SiteSettings déjà présent, ignoré.")
            return

        settings_obj = SiteSettings(
            company_name="KANYEL SARL",
            slogan="La lumière de l'Éternel",
            leader_name="Konan KANYEL",
            leader_role_fr="Président Directeur Général",
            leader_role_en="Chief Executive Officer",
            address="Nanan, à côté de l'Hôtel Holidays, Yamoussoukro, Côte d'Ivoire",
            phone_1="+225 27 34 77 42 87",
            phone_2="+225 07 07 03 07 97",
            phone_3="+225 01 40 17 81 17",
            email_main="kanyelsarl3@gmail.com",
            email_leader="konan@kanyelsarl.com",
            website="www.kanyelsarl.com",
            hours_fr="Lundi – Samedi, sur rendez-vous",
            hours_en="Monday – Saturday, by appointment",
            hero_title_fr="Bâtisseurs de confiance, partenaires de vos ambitions",
            hero_title_en="Trusted builders, partners in your ambitions",
            hero_subtitle_fr="Une entreprise ivoirienne multisectorielle basée à Yamoussoukro, active dans le lotissement, le bâtiment & travaux publics, l'import-export, le transport & la logistique, ainsi que les achats et ventes.",
            hero_subtitle_en="An Ivorian multi-sector company based in Yamoussoukro, active in land subdivision, construction & public works, import-export, transport & logistics, and buying & selling.",
            about_paragraph_1_fr="Implantée à Nanan, à côté de l'Hôtel Holidays à Yamoussoukro, KANYEL SARL accompagne particuliers, entreprises et institutions dans leurs projets de lotissement et d'aménagement, de construction, de commerce international et de logistique.",
            about_paragraph_1_en="Based in Nanan, next to the Holidays Hotel in Yamoussoukro, KANYEL SARL supports individuals, companies, and institutions in their land subdivision and development projects, construction, international trade, and logistics.",
            about_paragraph_2_fr="Sous la direction de son Président Directeur Général, l'entreprise s'appuie sur un réseau solide de partenaires et un engagement constant pour la qualité.",
            about_paragraph_2_en="Under the leadership of its Chief Executive Officer, the company relies on a strong network of partners and a constant commitment to quality.",
            about_image_caption="Yamoussoukro, Côte d'Ivoire",
        )

        hero_path = NEXT_PUBLIC / "gallery" / "btp.jpg"
        about_path = NEXT_PUBLIC / "hero" / "yamoussoukro.jpg"
        if hero_path.exists():
            with open(hero_path, "rb") as f:
                settings_obj.hero_image.save("btp.jpg", File(f), save=False)
        if about_path.exists():
            with open(about_path, "rb") as f:
                settings_obj.about_image.save("yamoussoukro.jpg", File(f), save=False)

        settings_obj.save()
        self.stdout.write(self.style.SUCCESS("SiteSettings créé."))

    def seed_departments(self):
        if Department.objects.exists():
            self.stdout.write("Departments déjà présents, ignoré.")
            return
        Department.objects.bulk_create([Department(**d) for d in DEPARTMENTS])
        self.stdout.write(self.style.SUCCESS(f"{len(DEPARTMENTS)} départements créés."))

    def seed_credentials(self):
        if Credential.objects.exists():
            self.stdout.write("Credentials déjà présents, ignoré.")
            return
        Credential.objects.bulk_create([Credential(**c) for c in CREDENTIALS])
        self.stdout.write(self.style.SUCCESS(f"{len(CREDENTIALS)} reconnaissances créées."))

    def seed_gallery(self):
        if GalleryItem.objects.exists():
            self.stdout.write("GalleryItems déjà présents, ignoré.")
            return
        for item in GALLERY:
            path = NEXT_PUBLIC / item.pop("file")
            obj = GalleryItem(
                order=item["order"], icon=item["icon"], accent=item["accent"],
                label_fr=item["label_fr"], label_en=item["label_en"],
            )
            if path.exists():
                with open(path, "rb") as f:
                    obj.image.save(path.name, File(f), save=False)
            obj.save()
        self.stdout.write(self.style.SUCCESS(f"{len(GALLERY)} photos de galerie créées."))
