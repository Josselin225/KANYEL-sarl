import os

from django.conf import settings
from django.db.models import F
from django.http import FileResponse, Http404
from django.utils._os import safe_join

from rest_framework import generics, permissions, status, views, viewsets
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle

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
from .notifications import notify_admin
from .serializers import (
    ArticleSerializer,
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
    PropertySerializer,
    QuoteRequestCreateSerializer,
    QuoteRequestSerializer,
    RealisationImageSerializer,
    RealisationSerializer,
    SiteSettingsSerializer,
    StatSerializer,
    TestimonialSerializer,
)


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
        return Response({"token": token.key, "username": user.username})


class SiteSettingsView(generics.RetrieveUpdateAPIView):
    serializer_class = SiteSettingsSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_object(self):
        return SiteSettings.objects.first()


class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = "slug"

    def get_queryset(self):
        if self.request.user and self.request.user.is_authenticated:
            return Department.objects.all()
        return Department.objects.filter(is_published=True)


class DepartmentImageViewSet(viewsets.ModelViewSet):
    queryset = DepartmentImage.objects.all()
    serializer_class = DepartmentImageSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        if self.request.user and self.request.user.is_authenticated:
            return DepartmentImage.objects.all()
        return DepartmentImage.objects.filter(is_published=True)


class CredentialViewSet(viewsets.ModelViewSet):
    queryset = Credential.objects.all()
    serializer_class = CredentialSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        if self.request.user and self.request.user.is_authenticated:
            return Credential.objects.all()
        return Credential.objects.filter(is_published=True)


class GalleryItemViewSet(viewsets.ModelViewSet):
    queryset = GalleryItem.objects.all()
    serializer_class = GalleryItemSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        if self.request.user and self.request.user.is_authenticated:
            return GalleryItem.objects.all()
        return GalleryItem.objects.filter(is_published=True)


class PropertyViewSet(viewsets.ModelViewSet):
    queryset = Property.objects.all()
    serializer_class = PropertySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        if self.request.user and self.request.user.is_authenticated:
            return Property.objects.all()
        return Property.objects.filter(is_published=True)


class TestimonialViewSet(viewsets.ModelViewSet):
    queryset = Testimonial.objects.all()
    serializer_class = TestimonialSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        if self.request.user and self.request.user.is_authenticated:
            return Testimonial.objects.all()
        return Testimonial.objects.filter(is_published=True)


class StatViewSet(viewsets.ModelViewSet):
    queryset = Stat.objects.all()
    serializer_class = StatSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        if self.request.user and self.request.user.is_authenticated:
            return Stat.objects.all()
        return Stat.objects.filter(is_published=True)


class PartnerViewSet(viewsets.ModelViewSet):
    queryset = Partner.objects.all()
    serializer_class = PartnerSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        if self.request.user and self.request.user.is_authenticated:
            return Partner.objects.all()
        return Partner.objects.filter(is_published=True)


class JobOfferViewSet(viewsets.ModelViewSet):
    queryset = JobOffer.objects.all()
    serializer_class = JobOfferSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

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
        return Response({"visit_count": settings_obj.visit_count})


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


class ContactMessageAdminViewSet(viewsets.ModelViewSet):
    """Authenticated-only management of received contact messages (list/read/mark-read/delete)."""

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


class JobApplicationAdminViewSet(viewsets.ModelViewSet):
    """Authenticated-only management of received job applications (list/read/mark-read/delete)."""

    queryset = JobApplication.objects.all()
    serializer_class = JobApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["get", "patch", "delete", "head", "options"]


class RealisationViewSet(viewsets.ModelViewSet):
    queryset = Realisation.objects.all()
    serializer_class = RealisationSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        if self.request.user and self.request.user.is_authenticated:
            return Realisation.objects.all()
        return Realisation.objects.filter(is_published=True)


class RealisationImageViewSet(viewsets.ModelViewSet):
    queryset = RealisationImage.objects.all()
    serializer_class = RealisationImageSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        if self.request.user and self.request.user.is_authenticated:
            return RealisationImage.objects.all()
        return RealisationImage.objects.filter(realisation__is_published=True)


class ArticleViewSet(viewsets.ModelViewSet):
    queryset = Article.objects.all()
    serializer_class = ArticleSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = "slug"

    def get_queryset(self):
        if self.request.user and self.request.user.is_authenticated:
            return Article.objects.all()
        return Article.objects.filter(is_published=True)


class FAQViewSet(viewsets.ModelViewSet):
    queryset = FAQ.objects.all()
    serializer_class = FAQSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

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


class QuoteRequestAdminViewSet(viewsets.ModelViewSet):
    """Authenticated-only management of received quote requests (list/read/mark-read/delete)."""

    queryset = QuoteRequest.objects.all()
    serializer_class = QuoteRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["get", "patch", "delete", "head", "options"]


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
