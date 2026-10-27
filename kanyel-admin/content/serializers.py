from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework.authtoken.models import Token

from .models import (
    AdminProfile,
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
    """Public-facing: excludes internal management fields (occupancy, tenant, exact amount)."""

    class Meta:
        model = Property
        fields = [
            "id", "order", "category", "title_fr", "title_en",
            "description_fr", "description_en", "location", "price", "image", "is_published",
        ]


class PropertyAdminSerializer(serializers.ModelSerializer):
    """Admin-only: adds the management fields used for internal reporting."""

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
    """Used by the public application form — full write access, no is_read."""

    class Meta:
        model = JobApplication
        fields = ["id", "job", "full_name", "email", "phone", "message", "cv", "cover_letter", "created_at"]
        read_only_fields = ["id", "created_at"]


class JobApplicationSerializer(serializers.ModelSerializer):
    """Used by the admin panel — content is read-only, only is_read can be toggled."""

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
    """Used by the public contact form — full write access."""

    class Meta:
        model = ContactMessage
        fields = ["id", "name", "email", "phone", "subject", "message", "created_at"]
        read_only_fields = ["id", "created_at"]


class ContactMessageSerializer(serializers.ModelSerializer):
    """Used by the admin panel — content is read-only, only is_read can be toggled."""

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
    """Used by the public quote-request form — full write access, no is_read."""

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
    """Used by the admin panel — content is read-only, only is_read can be toggled."""

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
    """Used by the public "Demander une visite" form on a property listing."""

    property = serializers.PrimaryKeyRelatedField(queryset=Property.objects.all())

    class Meta:
        model = PropertyVisitRequest
        fields = ["id", "property", "full_name", "email", "phone", "preferred_date", "message", "created_at"]
        read_only_fields = ["id", "created_at"]


class PropertyVisitRequestSerializer(serializers.ModelSerializer):
    """Used by the admin panel — content is read-only, only is_read can be toggled."""

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
    """Used by the admin panel to list/manage additional admin accounts."""

    role = serializers.ChoiceField(choices=AdminProfile.ROLE_CHOICES, source="admin_profile.role")
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ["id", "username", "role", "is_active", "password"]

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
            # Changing the password is the admin's remediation path after a suspected
            # compromise — revoke the existing token so it doesn't outlive the reset.
            Token.objects.filter(user=instance).delete()
        instance.is_active = validated_data.get("is_active", instance.is_active)
        instance.save()
        if profile_data:
            AdminProfile.objects.update_or_create(user=instance, defaults={"role": profile_data["role"]})
        return instance


class NewsletterSubscriberCreateSerializer(serializers.ModelSerializer):
    """Used by the public newsletter sign-up form."""

    # Re-declared without the model's automatic UniqueValidator: re-subscribing
    # a previously unsubscribed address reactivates it instead of being
    # rejected outright, which validate_email()/create() below handle.
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
        # Re-activates a previously unsubscribed address instead of hitting the
        # unique constraint on email.
        subscriber, _ = NewsletterSubscriber.objects.update_or_create(
            email__iexact=validated_data["email"],
            defaults={"email": validated_data["email"], "is_active": True},
        )
        return subscriber


class NewsletterSubscriberSerializer(serializers.ModelSerializer):
    """Used by the admin panel."""

    class Meta:
        model = NewsletterSubscriber
        fields = ["id", "email", "created_at", "is_active"]
        read_only_fields = ["id", "email", "created_at"]
