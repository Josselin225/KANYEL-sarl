from django.db.models import F

from rest_framework import generics, permissions, views, viewsets
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle

from .models import Credential, Department, DepartmentImage, GalleryItem, JobApplication, JobOffer, Partner, Property, SiteSettings, Stat, Testimonial, ContactMessage
from .serializers import (
    ContactMessageCreateSerializer,
    ContactMessageSerializer,
    CredentialSerializer,
    DepartmentImageSerializer,
    DepartmentSerializer,
    GalleryItemSerializer,
    JobApplicationCreateSerializer,
    JobApplicationSerializer,
    JobOfferSerializer,
    PartnerSerializer,
    PropertySerializer,
    SiteSettingsSerializer,
    StatSerializer,
    TestimonialSerializer,
)


class LoginView(ObtainAuthToken):
    """POST {username, password} -> {token, username}. Used by the custom /admin panel."""

    permission_classes = [permissions.AllowAny]

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


class ContactMessageCreateView(generics.CreateAPIView):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageCreateSerializer
    permission_classes = [permissions.AllowAny]
    throttle_classes = [AnonRateThrottle]


class ContactMessageAdminViewSet(viewsets.ModelViewSet):
    """Authenticated-only management of received contact messages (list/read/mark-read/delete)."""

    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["get", "patch", "delete", "head", "options"]


class JobApplicationCreateView(generics.CreateAPIView):
    queryset = JobApplication.objects.all()
    serializer_class = JobApplicationCreateSerializer
    permission_classes = [permissions.AllowAny]
    throttle_classes = [AnonRateThrottle]


class JobApplicationAdminViewSet(viewsets.ModelViewSet):
    """Authenticated-only management of received job applications (list/read/mark-read/delete)."""

    queryset = JobApplication.objects.all()
    serializer_class = JobApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["get", "patch", "delete", "head", "options"]
