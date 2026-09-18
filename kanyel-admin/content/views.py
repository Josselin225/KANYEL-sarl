import os
from datetime import timedelta

from django.conf import settings
from django.contrib.auth.models import User
from django.db.models import F, Q
from django.http import FileResponse, Http404
from django.utils import timezone
from django.utils._os import safe_join

from rest_framework import generics, permissions, status, views, viewsets
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle

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
    Partner,
    Property,
    PropertyImage,
    QuoteRequest,
    Realisation,
    RealisationImage,
    SiteSettings,
    Stat,
    Testimonial,
    VisitLog,
)
from .notifications import notify_admin
from .permissions import DenyReceptionRole, IsFullAdmin
from .serializers import (
    AdminUserSerializer,
    ArticleSerializer,
    AuditLogEntrySerializer,
    ContactMessageCreateSerializer,
    ContactMessageSerializer,
    CredentialSerializer,
    DepartmentImageSerializer,
    DepartmentSerializer,
    FAQSerializer,
    GalleryItemSerializer,
    JobApplicationCreateSerializer,
    JobApplicationSerializer,
    JobOfferSerializer,
    PartnerSerializer,
    PropertyImageSerializer,
    PropertySerializer,
    QuoteRequestCreateSerializer,
    QuoteRequestSerializer,
    RealisationImageSerializer,
    RealisationSerializer,
    SiteSettingsSerializer,
    StatSerializer,
    TestimonialSerializer,
    VisitLogSerializer,
)


class AuditLogMixin:
    """Records who created/changed/deleted what, for accountability once
    more than one admin account exists."""

    resource_key = ""

    def _log(self, action, instance):
        user = self.request.user if self.request.user.is_authenticated else None
        AuditLogEntry.objects.create(
            user=user,
            action=action,
            resource=self.resource_key or self.__class__.__name__,
            object_repr=str(instance)[:255],
        )

    def perform_create(self, serializer):
        serializer.save()
        self._log(AuditLogEntry.ACTION_CREATE, serializer.instance)

    def perform_update(self, serializer):
        serializer.save()
        self._log(AuditLogEntry.ACTION_UPDATE, serializer.instance)

    def perform_destroy(self, instance):
        repr_before_delete = str(instance)[:255]
        instance.delete()
        self._log(AuditLogEntry.ACTION_DELETE, repr_before_delete)


class HoneypotCreateMixin:
    """Silently discards spam-bot submissions that fill a hidden field real users never see."""

    honeypot_field = "website"

    def create(self, request, *args, **kwargs):
        if request.data.get(self.honeypot_field):
            return Response(status=status.HTTP_201_CREATED)
        return super().create(request, *args, **kwargs)


class LoginThrottle(AnonRateThrottle):
    """Strict, dedicated rate for the login endpoint to slow down credential guessing."""

    scope = "login"


class LoginView(ObtainAuthToken):
    """POST {username, password} -> {token, username}. Used by the custom /admin panel."""

    permission_classes = [permissions.AllowAny]
    throttle_classes = [LoginThrottle]

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        token, _ = Token.objects.get_or_create(user=user)
        profile = getattr(user, "admin_profile", None)
        role = profile.role if profile else AdminProfile.ROLE_FULL
        return Response({"token": token.key, "username": user.username, "role": role})


class SiteSettingsView(AuditLogMixin, generics.RetrieveUpdateAPIView):
    resource_key = "site-settings"
    serializer_class = SiteSettingsSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, DenyReceptionRole]

    def get_object(self):
        return SiteSettings.objects.first()


class DepartmentViewSet(AuditLogMixin, viewsets.ModelViewSet):
    resource_key = "departments"
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, DenyReceptionRole]
    lookup_field = "slug"

    def get_queryset(self):
        if self.request.user and self.request.user.is_authenticated:
            return Department.objects.all()
        return Department.objects.filter(is_published=True)


class DepartmentImageViewSet(AuditLogMixin, viewsets.ModelViewSet):
    resource_key = "department-images"
    queryset = DepartmentImage.objects.all()
    serializer_class = DepartmentImageSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, DenyReceptionRole]

    def get_queryset(self):
        if self.request.user and self.request.user.is_authenticated:
            return DepartmentImage.objects.all()
        return DepartmentImage.objects.filter(is_published=True)


class CredentialViewSet(AuditLogMixin, viewsets.ModelViewSet):
    resource_key = "credentials"
    queryset = Credential.objects.all()
    serializer_class = CredentialSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, DenyReceptionRole]

    def get_queryset(self):
        if self.request.user and self.request.user.is_authenticated:
            return Credential.objects.all()
        return Credential.objects.filter(is_published=True)


class GalleryItemViewSet(AuditLogMixin, viewsets.ModelViewSet):
    resource_key = "gallery-items"
    queryset = GalleryItem.objects.all()
    serializer_class = GalleryItemSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, DenyReceptionRole]

    def get_queryset(self):
        if self.request.user and self.request.user.is_authenticated:
            return GalleryItem.objects.all()
        return GalleryItem.objects.filter(is_published=True)


class PropertyViewSet(AuditLogMixin, viewsets.ModelViewSet):
    resource_key = "properties"
    queryset = Property.objects.all()
    serializer_class = PropertySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, DenyReceptionRole]

    def get_queryset(self):
        # "price" is free text (e.g. "25 000 000 FCFA" or "Sur demande"), so it
        # cannot be filtered numerically in SQL — min/max price filtering is
        # done client-side instead, on the parsed numeric value.
        queryset = Property.objects.all() if self._is_staff() else Property.objects.filter(is_published=True)
        params = self.request.query_params
        category = params.get("category")
        location = params.get("location")
        if category:
            queryset = queryset.filter(category=category)
        if location:
            queryset = queryset.filter(location__icontains=location)
        return queryset

    def _is_staff(self):
        return bool(self.request.user and self.request.user.is_authenticated)


class PropertyImageViewSet(AuditLogMixin, viewsets.ModelViewSet):
    resource_key = "property-images"
    queryset = PropertyImage.objects.all()
    serializer_class = PropertyImageSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, DenyReceptionRole]

    def get_queryset(self):
        if self.request.user and self.request.user.is_authenticated:
            return PropertyImage.objects.all()
        return PropertyImage.objects.filter(property__is_published=True)


class TestimonialViewSet(AuditLogMixin, viewsets.ModelViewSet):
    resource_key = "testimonials"
    queryset = Testimonial.objects.all()
    serializer_class = TestimonialSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, DenyReceptionRole]

    def get_queryset(self):
        if self.request.user and self.request.user.is_authenticated:
            return Testimonial.objects.all()
        return Testimonial.objects.filter(is_published=True)


class StatViewSet(AuditLogMixin, viewsets.ModelViewSet):
    resource_key = "stats"
    queryset = Stat.objects.all()
    serializer_class = StatSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, DenyReceptionRole]

    def get_queryset(self):
        if self.request.user and self.request.user.is_authenticated:
            return Stat.objects.all()
        return Stat.objects.filter(is_published=True)


class PartnerViewSet(AuditLogMixin, viewsets.ModelViewSet):
    resource_key = "partners"
    queryset = Partner.objects.all()
    serializer_class = PartnerSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, DenyReceptionRole]

    def get_queryset(self):
        if self.request.user and self.request.user.is_authenticated:
            return Partner.objects.all()
        return Partner.objects.filter(is_published=True)


class JobOfferViewSet(AuditLogMixin, viewsets.ModelViewSet):
    resource_key = "job-offers"
    queryset = JobOffer.objects.all()
    serializer_class = JobOfferSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, DenyReceptionRole]

    def get_queryset(self):
        if self.request.user and self.request.user.is_authenticated:
            return JobOffer.objects.all()
        return JobOffer.objects.filter(is_published=True)


class IncrementVisitView(views.APIView):
    """POST-only counter bump, called once per visitor/day from the frontend."""

    permission_classes = [permissions.AllowAny]
    throttle_classes = [AnonRateThrottle]

    def post(self, request, *args, **kwargs):
        settings_obj = SiteSettings.objects.first()
        if not settings_obj:
            return Response({"visit_count": 0})
        SiteSettings.objects.filter(pk=settings_obj.pk).update(visit_count=F("visit_count") + 1)
        settings_obj.refresh_from_db(fields=["visit_count"])

        today = timezone.localdate()
        log, _ = VisitLog.objects.get_or_create(date=today)
        VisitLog.objects.filter(pk=log.pk).update(count=F("count") + 1)

        return Response({"visit_count": settings_obj.visit_count})


class VisitStatsView(views.APIView):
    """Last 30 days of real visit counts, for the admin dashboard chart."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        since = timezone.localdate() - timedelta(days=29)
        logs = VisitLog.objects.filter(date__gte=since).order_by("date")
        return Response(VisitLogSerializer(logs, many=True).data)


class SearchView(views.APIView):
    """Simple site-wide search across activities, properties, articles and realisations."""

    permission_classes = [permissions.AllowAny]
    throttle_classes = [AnonRateThrottle]

    def get(self, request, *args, **kwargs):
        query = request.query_params.get("q", "").strip()
        if not query or len(query) < 2:
            return Response([])

        results = []

        for dept in Department.objects.filter(is_published=True).filter(
            Q(title_fr__icontains=query) | Q(title_en__icontains=query)
            | Q(description_fr__icontains=query) | Q(description_en__icontains=query)
        )[:10]:
            results.append({
                "type": "department", "title": dept.title_fr,
                "url": f"/activites/{dept.slug}", "excerpt": dept.description_fr,
            })

        for prop in Property.objects.filter(is_published=True).filter(
            Q(title_fr__icontains=query) | Q(title_en__icontains=query) | Q(location__icontains=query)
        )[:10]:
            results.append({
                "type": "property", "title": prop.title_fr,
                "url": "/immobilier", "excerpt": prop.location,
            })

        for article in Article.objects.filter(is_published=True).filter(
            Q(title_fr__icontains=query) | Q(title_en__icontains=query) | Q(excerpt_fr__icontains=query)
        )[:10]:
            results.append({
                "type": "article", "title": article.title_fr,
                "url": f"/actualites/{article.slug}", "excerpt": article.excerpt_fr,
            })

        for realisation in Realisation.objects.filter(is_published=True).filter(
            Q(title_fr__icontains=query) | Q(title_en__icontains=query) | Q(location__icontains=query)
        )[:10]:
            results.append({
                "type": "realisation", "title": realisation.title_fr,
                "url": "/realisations", "excerpt": realisation.description_fr,
            })

        return Response(results)


class AdminUserViewSet(AuditLogMixin, viewsets.ModelViewSet):
    """Management of additional admin accounts — reserved to the "full" role."""

    resource_key = "admin-users"
    queryset = User.objects.all().order_by("username")
    serializer_class = AdminUserSerializer
    permission_classes = [IsFullAdmin]


class ChangeOwnPasswordView(views.APIView):
    """Lets any authenticated admin account (full or reception) change its own
    password. Issues a fresh token and revokes the old one, so a compromised
    token doesn't survive the one remediation a user can self-serve."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        current_password = request.data.get("current_password", "")
        new_password = request.data.get("new_password", "")

        if not request.user.check_password(current_password):
            return Response({"current_password": "Mot de passe actuel incorrect."}, status=400)
        if len(new_password) < 8:
            return Response({"new_password": "Le nouveau mot de passe doit contenir au moins 8 caractères."}, status=400)

        request.user.set_password(new_password)
        request.user.save()
        Token.objects.filter(user=request.user).delete()
        token = Token.objects.create(user=request.user)
        return Response({"token": token.key})


class ContactMessageCreateView(HoneypotCreateMixin, generics.CreateAPIView):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageCreateSerializer
    permission_classes = [permissions.AllowAny]
    throttle_classes = [AnonRateThrottle]

    def perform_create(self, serializer):
        instance = serializer.save()
        notify_admin(
            f"Nouveau message de {instance.name}",
            f"Sujet : {instance.subject or 'Sans objet'}\n"
            f"E-mail : {instance.email}\nTéléphone : {instance.phone}\n\n{instance.message}",
        )


class ContactMessageAdminViewSet(AuditLogMixin, viewsets.ModelViewSet):
    """Authenticated-only management of received contact messages (list/read/mark-read/delete)."""

    resource_key = "contact-messages"
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["get", "patch", "delete", "head", "options"]


class JobApplicationCreateView(HoneypotCreateMixin, generics.CreateAPIView):
    queryset = JobApplication.objects.all()
    serializer_class = JobApplicationCreateSerializer
    permission_classes = [permissions.AllowAny]
    throttle_classes = [AnonRateThrottle]

    def perform_create(self, serializer):
        instance = serializer.save()
        job_title = instance.job.title_fr if instance.job else "Candidature spontanée"
        notify_admin(
            f"Nouvelle candidature — {job_title}",
            f"Candidat : {instance.full_name}\nE-mail : {instance.email}\nTéléphone : {instance.phone}\n\n{instance.message}",
        )


class JobApplicationAdminViewSet(AuditLogMixin, viewsets.ModelViewSet):
    """Authenticated-only management of received job applications (list/read/mark-read/delete)."""

    resource_key = "job-applications"
    queryset = JobApplication.objects.all()
    serializer_class = JobApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["get", "patch", "delete", "head", "options"]


class RealisationViewSet(AuditLogMixin, viewsets.ModelViewSet):
    resource_key = "realisations"
    queryset = Realisation.objects.all()
    serializer_class = RealisationSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, DenyReceptionRole]

    def get_queryset(self):
        if self.request.user and self.request.user.is_authenticated:
            return Realisation.objects.all()
        return Realisation.objects.filter(is_published=True)


class RealisationImageViewSet(AuditLogMixin, viewsets.ModelViewSet):
    resource_key = "realisation-images"
    queryset = RealisationImage.objects.all()
    serializer_class = RealisationImageSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, DenyReceptionRole]

    def get_queryset(self):
        if self.request.user and self.request.user.is_authenticated:
            return RealisationImage.objects.all()
        return RealisationImage.objects.filter(realisation__is_published=True)


class ArticleViewSet(AuditLogMixin, viewsets.ModelViewSet):
    resource_key = "articles"
    queryset = Article.objects.all()
    serializer_class = ArticleSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, DenyReceptionRole]
    lookup_field = "slug"

    def get_queryset(self):
        if self.request.user and self.request.user.is_authenticated:
            return Article.objects.all()
        return Article.objects.filter(is_published=True)


class FAQViewSet(AuditLogMixin, viewsets.ModelViewSet):
    resource_key = "faq"
    queryset = FAQ.objects.all()
    serializer_class = FAQSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, DenyReceptionRole]

    def get_queryset(self):
        if self.request.user and self.request.user.is_authenticated:
            return FAQ.objects.all()
        return FAQ.objects.filter(is_published=True)


class QuoteRequestCreateView(HoneypotCreateMixin, generics.CreateAPIView):
    queryset = QuoteRequest.objects.all()
    serializer_class = QuoteRequestCreateSerializer
    permission_classes = [permissions.AllowAny]
    throttle_classes = [AnonRateThrottle]

    def perform_create(self, serializer):
        instance = serializer.save()
        dept = instance.department.title_fr if instance.department else "Devis général"
        notify_admin(
            f"Nouvelle demande de devis — {dept}",
            f"Nom : {instance.full_name}\nE-mail : {instance.email}\nTéléphone : {instance.phone}\n"
            f"Budget : {instance.get_budget_display()}\nDélai : {instance.get_timeline_display()}\n\n{instance.description}",
        )


class QuoteRequestAdminViewSet(AuditLogMixin, viewsets.ModelViewSet):
    """Authenticated-only management of received quote requests (list/read/mark-read/delete)."""

    resource_key = "quote-requests"
    queryset = QuoteRequest.objects.all()
    serializer_class = QuoteRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["get", "patch", "delete", "head", "options"]


class AuditLogEntryViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only log of who did what — visible only to full admins."""

    queryset = AuditLogEntry.objects.all()
    serializer_class = AuditLogEntrySerializer
    permission_classes = [IsFullAdmin]


class ProtectedMediaView(views.APIView):
    """Serves files under media/applications/ (CVs, cover letters — personal
    data) to authenticated staff only, instead of the public media server."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, path):
        try:
            full_path = safe_join(str(settings.MEDIA_ROOT / "applications"), path)
        except ValueError:
            raise Http404
        if not os.path.isfile(full_path):
            raise Http404
        return FileResponse(open(full_path, "rb"), as_attachment=True, filename=os.path.basename(full_path))
