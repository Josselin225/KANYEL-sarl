from rest_framework import serializers

from .models import Credential, Department, DepartmentImage, GalleryItem, JobApplication, JobOffer, Partner, Property, SiteSettings, Stat, Testimonial, ContactMessage


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
    class Meta:
        model = Property
        fields = [
            "id", "order", "category", "title_fr", "title_en",
            "description_fr", "description_en", "location", "price", "image", "is_published",
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
