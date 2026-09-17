from django.contrib import admin
from django.utils.html import format_html

from .models import (
    Article,
    ContactMessage,
    Credential,
    Department,
    DepartmentImage,
    FAQ,
    GalleryItem,
    JobApplication,
    JobOffer,
    Partner,
    Property,
    QuoteRequest,
    Realisation,
    RealisationImage,
    SiteSettings,
    Stat,
    Testimonial,
)


@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    fieldsets = (
        ("Identité", {"fields": ("company_name", "slogan_fr", "slogan_en", "leader_name", "leader_role_fr", "leader_role_en", "leader_photo")}),
        ("Mot du DG", {"fields": ("ceo_message_fr", "ceo_message_en")}),
        ("Coordonnées", {"fields": (
            "address_fr", "address_en", "latitude", "longitude", "phone_1", "phone_2", "phone_3", "whatsapp_number",
            "email_main", "email_leader", "website", "hours_fr", "hours_en",
        )}),
        ("Réseaux sociaux", {"fields": (
            "facebook_url", "instagram_url", "linkedin_url", "x_url", "tiktok_url", "youtube_url",
        ), "description": "Laisser vide pour masquer l'icône correspondante sur le site."}),
        ("Page d'accueil (Hero)", {"fields": (
            "hero_title_fr", "hero_title_en", "hero_subtitle_fr", "hero_subtitle_en", "hero_image",
        )}),
        ("Section À propos", {"fields": (
            "about_paragraph_1_fr", "about_paragraph_1_en",
            "about_paragraph_2_fr", "about_paragraph_2_en",
            "about_image", "about_image_caption",
        )}),
        ("Statistiques", {"fields": ("visit_count",), "description": "Compteur de visites, incrémenté automatiquement. Modifiable manuellement si besoin."}),
    )

    def has_add_permission(self, request):
        return not SiteSettings.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False


class DepartmentImageInline(admin.TabularInline):
    model = DepartmentImage
    extra = 1
    fields = ("order", "image", "caption_fr", "caption_en", "is_published")


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ("order", "title_fr", "slug", "icon", "accent", "has_property_listing", "is_published")
    list_display_links = ("title_fr",)
    list_editable = ("order", "is_published")
    list_filter = ("is_published", "accent", "has_property_listing")
    search_fields = ("title_fr", "title_en")
    prepopulated_fields = {"slug": ("title_fr",)}
    inlines = [DepartmentImageInline]
    fieldsets = (
        (None, {"fields": ("order", "slug", "icon", "accent", "has_property_listing", "is_published")}),
        ("Français", {"fields": ("title_fr", "description_fr", "detail_content_fr")}),
        ("English", {"fields": ("title_en", "description_en", "detail_content_en")}),
        ("Page détail", {"fields": ("detail_image",)}),
    )


@admin.register(DepartmentImage)
class DepartmentImageAdmin(admin.ModelAdmin):
    list_display = ("department", "order", "thumbnail", "caption_fr", "is_published")
    list_display_links = ("department",)
    list_editable = ("order", "is_published")
    list_filter = ("is_published", "department")

    def thumbnail(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="height:40px;border-radius:6px" />', obj.image.url)
        return "—"

    thumbnail.short_description = "Aperçu"


@admin.register(Credential)
class CredentialAdmin(admin.ModelAdmin):
    list_display = ("order", "title_fr", "is_published")
    list_display_links = ("title_fr",)
    list_editable = ("order", "is_published")
    fieldsets = (
        (None, {"fields": ("order", "is_published")}),
        ("Français", {"fields": ("title_fr", "description_fr")}),
        ("English", {"fields": ("title_en", "description_en")}),
    )


@admin.register(GalleryItem)
class GalleryItemAdmin(admin.ModelAdmin):
    list_display = ("order", "thumbnail", "label_fr", "icon", "accent", "is_published")
    list_display_links = ("label_fr",)
    list_editable = ("order", "is_published")
    list_filter = ("is_published", "accent")
    fieldsets = (
        (None, {"fields": ("order", "icon", "accent", "image", "is_published")}),
        ("Français", {"fields": ("label_fr",)}),
        ("English", {"fields": ("label_en",)}),
    )

    def thumbnail(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="height:40px;border-radius:6px" />', obj.image.url)
        return "—"

    thumbnail.short_description = "Aperçu"


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ("order", "thumbnail", "title_fr", "category", "location", "price", "is_published")
    list_display_links = ("title_fr",)
    list_editable = ("order", "is_published")
    list_filter = ("is_published", "category")
    search_fields = ("title_fr", "title_en", "location")
    fieldsets = (
        (None, {"fields": ("order", "category", "image", "location", "price", "is_published")}),
        ("Français", {"fields": ("title_fr", "description_fr")}),
        ("English", {"fields": ("title_en", "description_en")}),
    )

    def thumbnail(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="height:40px;border-radius:6px" />', obj.image.url)
        return "—"

    thumbnail.short_description = "Aperçu"


@admin.register(Testimonial)
class TestimonialAdmin(admin.ModelAdmin):
    list_display = ("order", "thumbnail", "client_name", "city", "is_published")
    list_display_links = ("client_name",)
    list_editable = ("order", "is_published")
    list_filter = ("is_published",)
    search_fields = ("client_name", "city")
    fieldsets = (
        (None, {"fields": ("order", "client_name", "city", "photo", "is_published")}),
        ("Français", {"fields": ("message_fr",)}),
        ("English", {"fields": ("message_en",)}),
    )

    def thumbnail(self, obj):
        if obj.photo:
            return format_html('<img src="{}" style="height:40px;width:40px;border-radius:50%;object-fit:cover" />', obj.photo.url)
        return "—"

    thumbnail.short_description = "Aperçu"


@admin.register(Stat)
class StatAdmin(admin.ModelAdmin):
    list_display = ("order", "value", "label_fr", "is_published")
    list_display_links = ("label_fr",)
    list_editable = ("order", "is_published")
    fieldsets = (
        (None, {"fields": ("order", "value", "is_published")}),
        ("Français", {"fields": ("label_fr",)}),
        ("English", {"fields": ("label_en",)}),
    )


@admin.register(Partner)
class PartnerAdmin(admin.ModelAdmin):
    list_display = ("order", "thumbnail", "name", "website_url", "is_published")
    list_display_links = ("name",)
    list_editable = ("order", "is_published")
    list_filter = ("is_published",)
    search_fields = ("name",)
    fieldsets = (
        (None, {"fields": ("order", "name", "logo", "website_url", "is_published")}),
    )

    def thumbnail(self, obj):
        if obj.logo:
            return format_html('<img src="{}" style="height:32px;max-width:100px;object-fit:contain" />', obj.logo.url)
        return "—"

    thumbnail.short_description = "Aperçu"


@admin.register(JobOffer)
class JobOfferAdmin(admin.ModelAdmin):
    list_display = ("order", "title_fr", "contract_type", "location", "deadline", "is_published")
    list_display_links = ("title_fr",)
    list_editable = ("order", "is_published")
    list_filter = ("is_published", "contract_type")
    search_fields = ("title_fr", "title_en", "location")
    fieldsets = (
        (None, {"fields": ("order", "contract_type", "location", "deadline", "is_published")}),
        ("Français", {"fields": ("title_fr", "description_fr", "requirements_fr")}),
        ("English", {"fields": ("title_en", "description_en", "requirements_en")}),
    )


@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display = ("created_at", "full_name", "job", "email", "is_read")
    list_filter = ("is_read", "created_at", "job")
    list_editable = ("is_read",)
    search_fields = ("full_name", "email", "message")
    readonly_fields = ("job", "full_name", "email", "phone", "message", "cv", "cover_letter", "created_at")

    def has_add_permission(self, request):
        return False


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ("created_at", "name", "email", "subject", "is_read")
    list_filter = ("is_read", "created_at")
    list_editable = ("is_read",)
    search_fields = ("name", "email", "message")
    readonly_fields = ("name", "email", "phone", "subject", "message", "created_at")

    def has_add_permission(self, request):
        return False


class RealisationImageInline(admin.TabularInline):
    model = RealisationImage
    extra = 1
    fields = ("order", "image")


@admin.register(Realisation)
class RealisationAdmin(admin.ModelAdmin):
    list_display = ("order", "thumbnail", "title_fr", "department", "client_name", "completed_at", "is_published")
    list_display_links = ("title_fr",)
    list_editable = ("order", "is_published")
    list_filter = ("is_published", "department")
    search_fields = ("title_fr", "title_en", "client_name")
    inlines = [RealisationImageInline]
    fieldsets = (
        (None, {"fields": ("order", "department", "client_name", "location", "completed_at", "image", "is_published")}),
        ("Français", {"fields": ("title_fr", "description_fr")}),
        ("English", {"fields": ("title_en", "description_en")}),
    )

    def thumbnail(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="height:40px;border-radius:6px" />', obj.image.url)
        return "—"

    thumbnail.short_description = "Aperçu"


@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ("published_at", "thumbnail", "title_fr", "is_published")
    list_display_links = ("title_fr",)
    list_editable = ("is_published",)
    list_filter = ("is_published",)
    search_fields = ("title_fr", "title_en", "content_fr")
    prepopulated_fields = {"slug": ("title_fr",)}
    fieldsets = (
        (None, {"fields": ("slug", "cover_image", "is_published")}),
        ("Français", {"fields": ("title_fr", "excerpt_fr", "content_fr")}),
        ("English", {"fields": ("title_en", "excerpt_en", "content_en")}),
    )

    def thumbnail(self, obj):
        if obj.cover_image:
            return format_html('<img src="{}" style="height:40px;border-radius:6px" />', obj.cover_image.url)
        return "—"

    thumbnail.short_description = "Aperçu"


@admin.register(FAQ)
class FAQAdmin(admin.ModelAdmin):
    list_display = ("order", "question_fr", "department", "is_published")
    list_display_links = ("question_fr",)
    list_editable = ("order", "is_published")
    list_filter = ("is_published", "department")
    fieldsets = (
        (None, {"fields": ("order", "department", "is_published")}),
        ("Français", {"fields": ("question_fr", "answer_fr")}),
        ("English", {"fields": ("question_en", "answer_en")}),
    )


@admin.register(QuoteRequest)
class QuoteRequestAdmin(admin.ModelAdmin):
    list_display = ("created_at", "full_name", "department", "budget", "timeline", "is_read")
    list_filter = ("is_read", "created_at", "department", "budget", "timeline")
    list_editable = ("is_read",)
    search_fields = ("full_name", "email", "description")
    readonly_fields = ("department", "full_name", "email", "phone", "budget", "timeline", "description", "created_at")

    def has_add_permission(self, request):
        return False


admin.site.site_header = "KANYEL SARL — Administration"
admin.site.site_title = "KANYEL SARL Admin"
admin.site.index_title = "Gestion du contenu du site"
