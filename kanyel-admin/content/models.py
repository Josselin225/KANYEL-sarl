from django.core.exceptions import ValidationError
from django.db import models
from django.utils.text import slugify


class SiteSettings(models.Model):
    """Singleton holding global, rarely-changing site content."""

    company_name = models.CharField("Nom de l'entreprise", max_length=200, default="KANYEL SARL")
    slogan_fr = models.CharField("Slogan (français)", max_length=200, default="La lumière de l'Éternel")
    slogan_en = models.CharField("Slogan (anglais)", max_length=200, default="The Light of the Eternal")

    leader_name = models.CharField("Nom du dirigeant", max_length=200, default="Konan KANYEL")
    leader_role_fr = models.CharField("Fonction (français)", max_length=200, default="Président Directeur Général")
    leader_role_en = models.CharField("Fonction (anglais)", max_length=200, default="Chief Executive Officer")
    leader_photo = models.ImageField("Photo du dirigeant", upload_to="leader/", blank=True, null=True)
    ceo_message_fr = models.TextField("Mot du DG (français)", blank=True)
    ceo_message_en = models.TextField("Mot du DG (anglais)", blank=True)

    address_fr = models.CharField("Adresse (français)", max_length=255, default="Nanan, à côté de l'Hôtel Holidays, Yamoussoukro, Côte d'Ivoire")
    address_en = models.CharField("Adresse (anglais)", max_length=255, default="Nanan, next to the Holidays Hotel, Yamoussoukro, Côte d'Ivoire")
    latitude = models.DecimalField(
        "Latitude", max_digits=9, decimal_places=6, blank=True, null=True,
        help_text="Coordonnée GPS pour positionner précisément la carte, ex. 6.827400. Laisser vide pour utiliser l'adresse texte.",
    )
    longitude = models.DecimalField(
        "Longitude", max_digits=9, decimal_places=6, blank=True, null=True,
        help_text="Coordonnée GPS pour positionner précisément la carte, ex. -5.289400. Laisser vide pour utiliser l'adresse texte.",
    )
    phone_1 = models.CharField("Téléphone 1", max_length=50, blank=True)
    phone_2 = models.CharField("Téléphone 2", max_length=50, blank=True)
    phone_3 = models.CharField("Téléphone 3", max_length=50, blank=True)
    whatsapp_number = models.CharField(
        "Numéro WhatsApp", max_length=50, blank=True,
        help_text="Avec indicatif pays, ex. +225 07 07 03 07 97. Laisser vide pour masquer le bouton WhatsApp du site.",
    )
    email_main = models.EmailField("E-mail principal", blank=True)
    email_leader = models.EmailField("E-mail du dirigeant", blank=True)
    website = models.CharField("Site web", max_length=200, blank=True)

    facebook_url = models.URLField("Facebook", blank=True)
    instagram_url = models.URLField("Instagram", blank=True)
    linkedin_url = models.URLField("LinkedIn", blank=True)
    x_url = models.URLField("X (Twitter)", blank=True)
    tiktok_url = models.URLField("TikTok", blank=True)
    youtube_url = models.URLField("YouTube", blank=True)
    hours_fr = models.CharField("Horaires (français)", max_length=200, default="Lundi – Samedi, sur rendez-vous")
    hours_en = models.CharField("Horaires (anglais)", max_length=200, default="Monday – Saturday, by appointment")

    hero_title_fr = models.CharField("Titre principal (français)", max_length=255, default="Bâtisseurs de confiance, partenaires de vos ambitions")
    hero_title_en = models.CharField("Titre principal (anglais)", max_length=255, default="Trusted builders, partners in your ambitions")
    hero_subtitle_fr = models.TextField("Sous-titre (français)", blank=True)
    hero_subtitle_en = models.TextField("Sous-titre (anglais)", blank=True)
    hero_image = models.ImageField("Photo de couverture", upload_to="hero/", blank=True, null=True)

    about_paragraph_1_fr = models.TextField("Paragraphe 1 (français)", blank=True)
    about_paragraph_1_en = models.TextField("Paragraphe 1 (anglais)", blank=True)
    about_paragraph_2_fr = models.TextField("Paragraphe 2 (français)", blank=True)
    about_paragraph_2_en = models.TextField("Paragraphe 2 (anglais)", blank=True)
    about_image = models.ImageField("Photo à propos", upload_to="about/", blank=True, null=True)
    about_image_caption = models.CharField("Légende de la photo", max_length=200, blank=True, default="Yamoussoukro, Côte d'Ivoire")

    visit_count = models.PositiveIntegerField(
        "Nombre de visites", default=0,
        help_text="Incrémenté automatiquement à chaque visite du site (une fois par visiteur et par jour). Modifiable manuellement si besoin.",
    )

    class Meta:
        verbose_name = "Paramètres du site"
        verbose_name_plural = "Paramètres du site"

    def __str__(self):
        return self.company_name

    def clean(self):
        if not self.pk and SiteSettings.objects.exists():
            raise ValidationError("Un seul enregistrement de paramètres est autorisé.")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)


class Department(models.Model):
    """A business activity / department shown in the "Nos activités" section."""

    ICON_CHOICES = [
        ("plot", "Lotissement (parcelle)"),
        ("building", "BTP (bâtiment)"),
        ("globe", "Import-Export (globe)"),
        ("truck", "Transport (camion)"),
        ("exchange", "Achats-Ventes (échange)"),
        ("home", "Immobilier (maison)"),
        ("box", "Négoce (colis)"),
    ]
    ACCENT_CHOICES = [("navy", "Bleu marine"), ("gold", "Or")]

    order = models.PositiveIntegerField("Ordre", default=0)
    slug = models.SlugField("Identifiant URL (slug)", max_length=220, unique=True, blank=True)
    icon = models.CharField("Icône", max_length=20, choices=ICON_CHOICES, default="building")
    accent = models.CharField("Couleur d'accent", max_length=10, choices=ACCENT_CHOICES, default="navy")
    title_fr = models.CharField("Titre (français)", max_length=200)
    title_en = models.CharField("Titre (anglais)", max_length=200)
    description_fr = models.TextField("Description courte (français)")
    description_en = models.TextField("Description courte (anglais)")
    detail_content_fr = models.TextField(
        "Contenu détaillé (français)", blank=True,
        help_text="Texte plus complet affiché sur la page dédiée à ce métier. Laisser vide pour réutiliser la description courte.",
    )
    detail_content_en = models.TextField(
        "Contenu détaillé (anglais)", blank=True,
        help_text="Fuller text shown on this trade's dedicated page. Leave blank to reuse the short description.",
    )
    detail_image = models.ImageField("Photo de la page détail", upload_to="departments/", blank=True, null=True)
    has_property_listing = models.BooleanField(
        "Afficher la liste des biens immobiliers", default=False,
        help_text="À cocher uniquement pour le département Gestion Immobilière : sa page affichera les biens gérés par l'agence.",
    )
    is_published = models.BooleanField("Publié", default=True)

    class Meta:
        ordering = ["order", "id"]
        verbose_name = "Département / Activité"
        verbose_name_plural = "Départements / Activités"

    def __str__(self):
        return self.title_fr

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.title_fr) or "activite"
            slug = base
            i = 2
            while Department.objects.exclude(pk=self.pk).filter(slug=slug).exists():
                slug = f"{base}-{i}"
                i += 1
            self.slug = slug
        super().save(*args, **kwargs)


class DepartmentImage(models.Model):
    """An extra photo shown in the gallery of a department's detail page."""

    department = models.ForeignKey(
        Department, related_name="gallery_images", on_delete=models.CASCADE, verbose_name="Activité",
    )
    order = models.PositiveIntegerField("Ordre", default=0)
    image = models.ImageField("Photo", upload_to="departments/gallery/")
    caption_fr = models.CharField("Légende (français)", max_length=200, blank=True)
    caption_en = models.CharField("Légende (anglais)", max_length=200, blank=True)
    is_published = models.BooleanField("Publié", default=True)

    class Meta:
        ordering = ["department", "order", "id"]
        verbose_name = "Photo de galerie (activité)"
        verbose_name_plural = "Photos de galerie (activités)"

    def __str__(self):
        return f"{self.department.title_fr} — #{self.order}"


class Credential(models.Model):
    """An institutional recognition/credential shown in the "À propos" section."""

    order = models.PositiveIntegerField("Ordre", default=0)
    title_fr = models.CharField("Titre (français)", max_length=255)
    title_en = models.CharField("Titre (anglais)", max_length=255)
    description_fr = models.TextField("Description (français)")
    description_en = models.TextField("Description (anglais)")
    is_published = models.BooleanField("Publié", default=True)

    class Meta:
        ordering = ["order", "id"]
        verbose_name = "Reconnaissance institutionnelle"
        verbose_name_plural = "Reconnaissances institutionnelles"

    def __str__(self):
        return self.title_fr


class GalleryItem(models.Model):
    """A photo tile shown in the "Domaines d'intervention" gallery."""

    ACCENT_CHOICES = [("navy", "Bleu marine"), ("gold", "Or")]

    order = models.PositiveIntegerField("Ordre", default=0)
    label_fr = models.CharField("Libellé (français)", max_length=200)
    label_en = models.CharField("Libellé (anglais)", max_length=200)
    icon = models.CharField("Icône", max_length=20, choices=Department.ICON_CHOICES, default="building")
    accent = models.CharField("Couleur d'accent", max_length=10, choices=ACCENT_CHOICES, default="navy")
    image = models.ImageField("Photo", upload_to="gallery/")
    is_published = models.BooleanField("Publié", default=True)

    class Meta:
        ordering = ["order", "id"]
        verbose_name = "Photo de la galerie"
        verbose_name_plural = "Photos de la galerie"

    def __str__(self):
        return self.label_fr


class Property(models.Model):
    """A managed property shown on the "Gestion Immobilière" department page."""

    CATEGORY_CHOICES = [
        ("villa", "Villa"),
        ("appartement", "Appartement"),
        ("terrain", "Terrain"),
        ("bureau_commerce", "Bureau / Commerce"),
        ("immeuble", "Immeuble"),
    ]

    order = models.PositiveIntegerField("Ordre", default=0)
    category = models.CharField("Catégorie", max_length=20, choices=CATEGORY_CHOICES, default="villa")
    title_fr = models.CharField("Titre (français)", max_length=200)
    title_en = models.CharField("Titre (anglais)", max_length=200)
    description_fr = models.TextField("Description (français)")
    description_en = models.TextField("Description (anglais)")
    location = models.CharField("Localisation", max_length=200, blank=True)
    price = models.CharField(
        "Prix / Loyer", max_length=100, blank=True,
        help_text="Ex. \"25 000 000 FCFA\", \"350 000 FCFA / mois\" ou \"Sur demande\".",
    )
    image = models.ImageField("Photo", upload_to="properties/")
    is_published = models.BooleanField("Publié", default=True)

    class Meta:
        ordering = ["category", "order", "id"]
        verbose_name = "Bien immobilier"
        verbose_name_plural = "Biens immobiliers"

    def __str__(self):
        return self.title_fr


class Stat(models.Model):
    """A key figure shown in the "Chiffres clés" section (e.g. completed projects)."""

    order = models.PositiveIntegerField("Ordre", default=0)
    label_fr = models.CharField("Libellé (français)", max_length=200)
    label_en = models.CharField("Libellé (anglais)", max_length=200)
    value = models.CharField("Valeur", max_length=50, help_text='Ex. "120", "500+", "15 ans".')
    is_published = models.BooleanField("Publié", default=True)

    class Meta:
        ordering = ["order", "id"]
        verbose_name = "Statistique clé"
        verbose_name_plural = "Statistiques clés"

    def __str__(self):
        return f"{self.value} — {self.label_fr}"


class Partner(models.Model):
    """A partner/client logo shown in the scrolling "Nos partenaires" band."""

    order = models.PositiveIntegerField("Ordre", default=0)
    name = models.CharField("Nom du partenaire", max_length=200)
    logo = models.ImageField("Logo", upload_to="partners/")
    website_url = models.URLField("Site web", blank=True, help_text="Facultatif. Rend le logo cliquable.")
    is_published = models.BooleanField("Publié", default=True)

    class Meta:
        ordering = ["order", "id"]
        verbose_name = "Partenaire"
        verbose_name_plural = "Partenaires"

    def __str__(self):
        return self.name


class Testimonial(models.Model):
    """A client testimonial shown on the "Témoignages" page."""

    order = models.PositiveIntegerField("Ordre", default=0)
    client_name = models.CharField("Nom du client", max_length=200)
    city = models.CharField("Ville", max_length=200, blank=True)
    photo = models.ImageField(
        "Photo", upload_to="testimonials/", blank=True, null=True,
        help_text="Facultatif. Si absent, les initiales du client seront affichées à la place.",
    )
    message_fr = models.TextField("Témoignage (français)")
    message_en = models.TextField("Témoignage (anglais)")
    is_published = models.BooleanField("Publié", default=True)

    class Meta:
        ordering = ["order", "id"]
        verbose_name = "Témoignage client"
        verbose_name_plural = "Témoignages clients"

    def __str__(self):
        return f"{self.client_name} — {self.city}" if self.city else self.client_name


class JobOffer(models.Model):
    """A job opening shown on the "Offres d'emploi" page."""

    CONTRACT_CHOICES = [
        ("cdi", "CDI"),
        ("cdd", "CDD"),
        ("stage", "Stage"),
        ("freelance", "Freelance / Prestation"),
    ]

    order = models.PositiveIntegerField("Ordre", default=0)
    title_fr = models.CharField("Intitulé du poste (français)", max_length=200)
    title_en = models.CharField("Intitulé du poste (anglais)", max_length=200)
    contract_type = models.CharField("Type de contrat", max_length=20, choices=CONTRACT_CHOICES, default="cdi")
    location = models.CharField("Lieu", max_length=200, default="Yamoussoukro, Côte d'Ivoire")
    description_fr = models.TextField("Description du poste (français)")
    description_en = models.TextField("Description du poste (anglais)")
    requirements_fr = models.TextField("Profil recherché (français)", blank=True)
    requirements_en = models.TextField("Profil recherché (anglais)", blank=True)
    deadline = models.DateField("Date limite de candidature", blank=True, null=True)
    is_published = models.BooleanField("Publié", default=True)
    created_at = models.DateTimeField("Créée le", auto_now_add=True)

    class Meta:
        ordering = ["order", "-created_at"]
        verbose_name = "Offre d'emploi"
        verbose_name_plural = "Offres d'emploi"

    def __str__(self):
        return self.title_fr


class JobApplication(models.Model):
    """A candidate application submitted through the public "Offres d'emploi" page."""

    job = models.ForeignKey(
        JobOffer, related_name="applications", on_delete=models.CASCADE,
        null=True, blank=True, verbose_name="Offre concernée",
        help_text="Vide pour une candidature spontanée.",
    )
    full_name = models.CharField("Nom complet", max_length=200)
    email = models.EmailField("E-mail")
    phone = models.CharField("Téléphone", max_length=50)
    message = models.TextField("Message", blank=True)
    cv = models.FileField("CV", upload_to="applications/cv/")
    cover_letter = models.FileField(
        "Lettre de motivation", upload_to="applications/cover_letters/", blank=True, null=True,
    )
    created_at = models.DateTimeField("Reçue le", auto_now_add=True)
    is_read = models.BooleanField("Lue", default=False)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Candidature"
        verbose_name_plural = "Candidatures"

    def __str__(self):
        return f"{self.full_name} — {self.job.title_fr if self.job else 'Candidature spontanée'}"


class ContactMessage(models.Model):
    """A message submitted through the public contact form."""

    name = models.CharField("Nom", max_length=200)
    email = models.EmailField("E-mail")
    phone = models.CharField("Téléphone", max_length=50)
    subject = models.CharField("Sujet", max_length=200, blank=True)
    message = models.TextField("Message")
    created_at = models.DateTimeField("Reçu le", auto_now_add=True)
    is_read = models.BooleanField("Lu", default=False)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Message de contact"
        verbose_name_plural = "Messages de contact"

    def __str__(self):
        return f"{self.name} — {self.subject or 'Sans objet'}"


class Realisation(models.Model):
    """A completed project shown in the "Nos réalisations" portfolio."""

    order = models.PositiveIntegerField("Ordre", default=0)
    department = models.ForeignKey(
        Department, related_name="realisations", on_delete=models.SET_NULL,
        null=True, blank=True, verbose_name="Activité concernée",
    )
    title_fr = models.CharField("Titre (français)", max_length=200)
    title_en = models.CharField("Titre (anglais)", max_length=200)
    description_fr = models.TextField("Description (français)")
    description_en = models.TextField("Description (anglais)")
    client_name = models.CharField("Client", max_length=200, blank=True, help_text="Facultatif.")
    location = models.CharField("Lieu", max_length=200, blank=True)
    completed_at = models.DateField("Terminé le", blank=True, null=True)
    image = models.ImageField("Photo principale", upload_to="realisations/")
    is_published = models.BooleanField("Publié", default=True)

    class Meta:
        ordering = ["order", "-completed_at", "id"]
        verbose_name = "Réalisation"
        verbose_name_plural = "Réalisations"

    def __str__(self):
        return self.title_fr


class RealisationImage(models.Model):
    """An extra photo shown in a realisation's own gallery."""

    realisation = models.ForeignKey(
        Realisation, related_name="gallery_images", on_delete=models.CASCADE, verbose_name="Réalisation",
    )
    order = models.PositiveIntegerField("Ordre", default=0)
    image = models.ImageField("Photo", upload_to="realisations/gallery/")

    class Meta:
        ordering = ["realisation", "order", "id"]
        verbose_name = "Photo de réalisation"
        verbose_name_plural = "Photos de réalisation"

    def __str__(self):
        return f"{self.realisation.title_fr} — #{self.order}"


class Article(models.Model):
    """A news post shown in the "Actualités" section."""

    slug = models.SlugField("Identifiant URL (slug)", max_length=220, unique=True, blank=True)
    title_fr = models.CharField("Titre (français)", max_length=200)
    title_en = models.CharField("Titre (anglais)", max_length=200)
    excerpt_fr = models.CharField("Résumé (français)", max_length=300, blank=True)
    excerpt_en = models.CharField("Résumé (anglais)", max_length=300, blank=True)
    content_fr = models.TextField("Contenu (français)")
    content_en = models.TextField("Contenu (anglais)")
    cover_image = models.ImageField("Photo de couverture", upload_to="articles/", blank=True, null=True)
    is_published = models.BooleanField("Publié", default=True)
    published_at = models.DateTimeField("Publié le", auto_now_add=True)

    class Meta:
        ordering = ["-published_at"]
        verbose_name = "Article"
        verbose_name_plural = "Articles"

    def __str__(self):
        return self.title_fr

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.title_fr) or "article"
            slug = base
            i = 2
            while Article.objects.exclude(pk=self.pk).filter(slug=slug).exists():
                slug = f"{base}-{i}"
                i += 1
            self.slug = slug
        super().save(*args, **kwargs)


class FAQ(models.Model):
    """A frequently asked question, optionally scoped to one department."""

    order = models.PositiveIntegerField("Ordre", default=0)
    department = models.ForeignKey(
        Department, related_name="faqs", on_delete=models.SET_NULL,
        null=True, blank=True, verbose_name="Activité concernée",
        help_text="Laisser vide pour une question générale.",
    )
    question_fr = models.CharField("Question (français)", max_length=300)
    question_en = models.CharField("Question (anglais)", max_length=300)
    answer_fr = models.TextField("Réponse (français)")
    answer_en = models.TextField("Réponse (anglais)")
    is_published = models.BooleanField("Publié", default=True)

    class Meta:
        ordering = ["order", "id"]
        verbose_name = "Question fréquente"
        verbose_name_plural = "Questions fréquentes"

    def __str__(self):
        return self.question_fr


class QuoteRequest(models.Model):
    """A structured quote request submitted through the public "Demander un devis" form."""

    BUDGET_CHOICES = [
        ("lt_5m", "Moins de 5 000 000 FCFA"),
        ("5m_20m", "5 000 000 – 20 000 000 FCFA"),
        ("20m_100m", "20 000 000 – 100 000 000 FCFA"),
        ("gt_100m", "Plus de 100 000 000 FCFA"),
        ("unknown", "À définir"),
    ]
    TIMELINE_CHOICES = [
        ("urgent", "Urgent (moins d'1 mois)"),
        ("1_3_months", "1 à 3 mois"),
        ("3_6_months", "3 à 6 mois"),
        ("6_plus_months", "Plus de 6 mois"),
        ("flexible", "Flexible"),
    ]

    department = models.ForeignKey(
        Department, related_name="quote_requests", on_delete=models.SET_NULL,
        null=True, blank=True, verbose_name="Activité concernée",
    )
    full_name = models.CharField("Nom complet", max_length=200)
    email = models.EmailField("E-mail")
    phone = models.CharField("Téléphone", max_length=50)
    budget = models.CharField("Budget estimé", max_length=20, choices=BUDGET_CHOICES, default="unknown")
    timeline = models.CharField("Délai souhaité", max_length=20, choices=TIMELINE_CHOICES, default="flexible")
    description = models.TextField("Description du projet")
    created_at = models.DateTimeField("Reçue le", auto_now_add=True)
    is_read = models.BooleanField("Lue", default=False)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Demande de devis"
        verbose_name_plural = "Demandes de devis"

    def __str__(self):
        return f"{self.full_name} — {self.department.title_fr if self.department else 'Devis général'}"
