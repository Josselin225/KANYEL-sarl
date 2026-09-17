from rest_framework.routers import DefaultRouter

from .views import (
    ContactMessageAdminViewSet,
    ContactMessageCreateView,
    CredentialViewSet,
    DepartmentImageViewSet,
    DepartmentViewSet,
    GalleryItemViewSet,
    IncrementVisitView,
    JobApplicationAdminViewSet,
    JobApplicationCreateView,
    JobOfferViewSet,
    LoginView,
    PartnerViewSet,
    PropertyViewSet,
    SiteSettingsView,
    StatViewSet,
    TestimonialViewSet,
)
from django.urls import path, include

router = DefaultRouter()
router.register("departments", DepartmentViewSet, basename="department")
router.register("credentials", CredentialViewSet, basename="credential")
router.register("gallery", GalleryItemViewSet, basename="gallery-item")
router.register("properties", PropertyViewSet, basename="property")
router.register("testimonials", TestimonialViewSet, basename="testimonial")
router.register("messages", ContactMessageAdminViewSet, basename="message-admin")
router.register("stats", StatViewSet, basename="stat")
router.register("partners", PartnerViewSet, basename="partner")
router.register("department-images", DepartmentImageViewSet, basename="department-image")
router.register("jobs", JobOfferViewSet, basename="job-offer")
router.register("job-applications", JobApplicationAdminViewSet, basename="job-application-admin")

urlpatterns = [
    path("auth/login/", LoginView.as_view(), name="admin-login"),
    path("settings/", SiteSettingsView.as_view(), name="site-settings"),
    path("contact/", ContactMessageCreateView.as_view(), name="contact-create"),
    path("applications/", JobApplicationCreateView.as_view(), name="application-create"),
    path("visit/", IncrementVisitView.as_view(), name="visit-increment"),
    path("", include(router.urls)),
]
