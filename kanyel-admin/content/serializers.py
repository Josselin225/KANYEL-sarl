from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from .models import (
    AdminProfile,
    AdminToken,
    Article,
    AuditLogEntry,
    ContactMessage,
    Credential,
    Department,
    DepartmentImage,
    FAQ,
    GalleryItem,
    JobApplication,
    JobOffer,
    NewsletterSubscriber,
    Partner,
    Property,
    PropertyImage,
    PropertyVisitRequest,
    QuoteRequest,
    Realisation,
    RealisationImage,
    SiteSettings,
    Stat,
    Testimonial,
    VisitLog,
)


class SiteSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSettings
        fields = "__all__"


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = [
            "id", "order", "slug", "icon", "accent",
            "title_fr", "title_en", "description_fr", "description_en",
            "detail_content_fr", "detail_content_en", "detail_image",
            "has_property_listing", "is_published",
        ]
        extra_kwargs = {"slug": {"required": False}}


class DepartmentImageSerializer(serializers.ModelSerializer):
    department = serializers.SlugRelatedField(slug_field="slug", queryset=Department.objects.all())

    class Meta:
        model = DepartmentImage
        fields = ["id", "department", "order", "image", "caption_fr", "caption_en", "is_published"]


class CredentialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Credential
        fields = ["id", "order", "title_fr", "title_en", "description_fr", "description_en", "is_published"]


class GalleryItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = GalleryItem
        fields = ["id", "order", "icon", "accent", "label_fr", "label_en", "image", "is_published"]


class PropertySerializer(serializers.ModelSerializer):
    """Côté public : exclut les champs de gestion internes (occupation, locataire, montant exact)."""

    class Meta:
        model = Property
        fields = [
            "id", "order", "category", "title_fr", "title_en",
            "description_fr", "description_en", "location", "price", "image", "is_published",
        ]


class PropertyAdminSerializer(serializers.ModelSerializer):
    """Réservé à l'admin : ajoute les champs de gestion utilisés pour le reporting interne."""

    class Meta:
        model = Property
        fields = [
            "id", "order", "category", "transaction_type", "title_fr", "title_en",
            "description_fr", "description_en", "location", "price", "price_amount",
            "is_occupied", "tenant_name", "image", "is_published",
        ]


class TestimonialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Testimonial
        fields = ["id", "order", "client_name", "city", "photo", "message_fr", "message_en", "is_published"]


class StatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stat
        fields = ["id", "order", "label_fr", "label_en", "value", "is_published"]


class PartnerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Partner
        fields = ["id", "order", "name", "logo", "website_url", "is_published"]


class JobOfferSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobOffer
        fields = [
            "id", "order", "title_fr", "title_en", "contract_type", "location",
            "description_fr", "description_en", "requirements_fr", "requirements_en",
            "deadline", "is_published", "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class JobApplicationCreateSerializer(serializers.ModelSerializer):
    """Utilisé par le formulaire public de candidature — écriture complète, sans is_read."""

    class Meta:
        model = JobApplication
        fields = ["id", "job", "full_name", "email", "phone", "message", "cv", "cover_letter", "created_at"]
        read_only_fields = ["id", "created_at"]


class JobApplicationSerializer(serializers.ModelSerializer):
    """Utilisé par le panneau admin — contenu en lecture seule, seul is_read peut être basculé."""

    job_title = serializers.SerializerMethodField()

    class Meta:
        model = JobApplication
        fields = [
            "id", "job", "job_title", "full_name", "email", "phone", "message",
            "cv", "cover_letter", "created_at", "is_read",
        ]
        read_only_fields = [
            "id", "created_at", "job_title", "job", "full_name", "email", "phone", "message", "cv", "cover_letter",
        ]

    def get_job_title(self, obj):
        return obj.job.title_fr if obj.job else None


class ContactMessageCreateSerializer(serializers.ModelSerializer):
    """Utilisé par le formulaire de contact public — écriture complète."""

    class Meta:
        model = ContactMessage
        fields = ["id", "name", "email", "phone", "subject", "message", "created_at"]
        read_only_fields = ["id", "created_at"]


class ContactMessageSerializer(serializers.ModelSerializer):
    """Utilisé par le panneau admin — contenu en lecture seule, seul is_read peut être basculé."""

    class Meta:
        model = ContactMessage
        fields = ["id", "name", "email", "phone", "subject", "message", "created_at", "is_read"]
        read_only_fields = ["id", "created_at", "name", "email", "phone", "subject", "message"]


class RealisationImageSerializer(serializers.ModelSerializer):
    realisation = serializers.PrimaryKeyRelatedField(queryset=Realisation.objects.all())

    class Meta:
        model = RealisationImage
        fields = ["id", "realisation", "order", "image"]


class RealisationSerializer(serializers.ModelSerializer):
    department = serializers.SlugRelatedField(
        slug_field="slug", queryset=Department.objects.all(), allow_null=True, required=False,
    )

    class Meta:
        model = Realisation
        fields = [
            "id", "order", "department", "title_fr", "title_en", "description_fr", "description_en",
            "client_name", "location", "completed_at", "image", "is_published",
        ]


class ArticleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Article
        fields = [
            "id", "slug", "title_fr", "title_en", "excerpt_fr", "excerpt_en",
            "content_fr", "content_en", "cover_image", "is_published", "published_at",
        ]
        read_only_fields = ["id", "slug", "published_at"]


class FAQSerializer(serializers.ModelSerializer):
    department = serializers.SlugRelatedField(
        slug_field="slug", queryset=Department.objects.all(), allow_null=True, required=False,
    )

    class Meta:
        model = FAQ
        fields = ["id", "order", "department", "question_fr", "question_en", "answer_fr", "answer_en", "is_published"]


class QuoteRequestCreateSerializer(serializers.ModelSerializer):
    """Utilisé par le formulaire public de demande de devis — écriture complète, sans is_read."""

    department = serializers.SlugRelatedField(
        slug_field="slug", queryset=Department.objects.all(), allow_null=True, required=False,
    )

    class Meta:
        model = QuoteRequest
        fields = [
            "id", "department", "full_name", "email", "phone", "budget", "timeline", "description", "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class QuoteRequestSerializer(serializers.ModelSerializer):
    """Utilisé par le panneau admin — contenu en lecture seule, seul is_read peut être basculé."""

    department_title = serializers.SerializerMethodField()

    class Meta:
        model = QuoteRequest
        fields = [
            "id", "department", "department_title", "full_name", "email", "phone",
            "budget", "timeline", "description", "created_at", "is_read",
        ]
        read_only_fields = [
            "id", "created_at", "department_title", "department", "full_name", "email", "phone",
            "budget", "timeline", "description",
        ]

    def get_department_title(self, obj):
        return obj.department.title_fr if obj.department else None


class PropertyVisitRequestCreateSerializer(serializers.ModelSerializer):
    """Utilisé par le formulaire public « Demander une visite » sur la fiche d'un bien."""

    property = serializers.PrimaryKeyRelatedField(queryset=Property.objects.all())

    class Meta:
        model = PropertyVisitRequest
        fields = ["id", "property", "full_name", "email", "phone", "preferred_date", "message", "created_at"]
        read_only_fields = ["id", "created_at"]


class PropertyVisitRequestSerializer(serializers.ModelSerializer):
    """Utilisé par le panneau admin — contenu en lecture seule, seul is_read peut être basculé."""

    property_title = serializers.SerializerMethodField()

    class Meta:
        model = PropertyVisitRequest
        fields = [
            "id", "property", "property_title", "full_name", "email", "phone",
            "preferred_date", "message", "created_at", "is_read",
        ]
        read_only_fields = [
            "id", "created_at", "property_title", "property", "full_name", "email", "phone",
            "preferred_date", "message",
        ]

    def get_property_title(self, obj):
        return obj.property.title_fr if obj.property else None


class PropertyImageSerializer(serializers.ModelSerializer):
    property = serializers.PrimaryKeyRelatedField(queryset=Property.objects.all())

    class Meta:
        model = PropertyImage
        fields = ["id", "property", "order", "image"]


class VisitLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = VisitLog
        fields = ["date", "count"]


class AuditLogEntrySerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField()

    class Meta:
        model = AuditLogEntry
        fields = ["id", "username", "action", "resource", "object_repr", "created_at"]

    def get_username(self, obj):
        return obj.user.username if obj.user else "—"


class AdminUserSerializer(serializers.ModelSerializer):
    """Utilisé par le panneau admin pour lister/gérer les comptes admin supplémentaires."""

    role = serializers.ChoiceField(choices=AdminProfile.ROLE_CHOICES, source="admin_profile.role")
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ["id", "username", "role", "is_active", "password"]

    def validate(self, attrs):
        password = attrs.get("password")
        if password:
            user = self.instance or User(username=attrs.get("username", ""))
            try:
                validate_password(password, user)
            except DjangoValidationError as exc:
                raise serializers.ValidationError({"password": list(exc.messages)})
        return attrs

    def create(self, validated_data):
        profile_data = validated_data.pop("admin_profile")
        password = validated_data.pop("password", None)
        if not password:
            raise serializers.ValidationError({"password": "Ce champ est obligatoire à la création."})
        user = User.objects.create_user(
            username=validated_data["username"],
            password=password,
            is_active=validated_data.get("is_active", True),
        )
        AdminProfile.objects.create(user=user, role=profile_data["role"])
        return user

    def update(self, instance, validated_data):
        profile_data = validated_data.pop("admin_profile", None)
        password = validated_data.pop("password", None)
        if password:
            instance.set_password(password)
            # Changer le mot de passe est le recours de l'admin en cas de compromission
            # suspectée — on révoque le token existant pour qu'il ne survive pas à la réinitialisation.
            AdminToken.objects.filter(user=instance).delete()
        instance.is_active = validated_data.get("is_active", instance.is_active)
        instance.save()
        if profile_data:
            AdminProfile.objects.update_or_create(user=instance, defaults={"role": profile_data["role"]})
        return instance


class NewsletterSubscriberCreateSerializer(serializers.ModelSerializer):
    """Utilisé par le formulaire public d'inscription à la newsletter."""

    # Redéclaré sans le UniqueValidator automatique du modèle : réinscrire une
    # adresse précédemment désinscrite la réactive au lieu d'être rejetée
    # d'emblée, ce que gèrent validate_email()/create() ci-dessous.
    email = serializers.EmailField()

    class Meta:
        model = NewsletterSubscriber
        fields = ["id", "email", "created_at"]
        read_only_fields = ["id", "created_at"]

    def validate_email(self, value):
        if NewsletterSubscriber.objects.filter(email__iexact=value, is_active=True).exists():
            raise serializers.ValidationError("Cette adresse e-mail est déjà inscrite.")
        return value

    def create(self, validated_data):
        # Réactive une adresse précédemment désinscrite au lieu de heurter la
        # contrainte d'unicité sur l'e-mail.
        subscriber, _ = NewsletterSubscriber.objects.update_or_create(
            email__iexact=validated_data["email"],
            defaults={"email": validated_data["email"], "is_active": True},
        )
        return subscriber


class NewsletterSubscriberSerializer(serializers.ModelSerializer):
    """Utilisé par le panneau admin."""

    class Meta:
        model = NewsletterSubscriber
        fields = ["id", "email", "created_at", "is_active"]
        read_only_fields = ["id", "email", "created_at"]
