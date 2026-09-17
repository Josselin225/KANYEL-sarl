from rest_framework.routers import DefaultRouter

from .views import (
    ArticleViewSet,
    ContactMessageAdminViewSet,
    ContactMessageCreateView,
    CredentialViewSet,
    DepartmentImageViewSet,
    DepartmentViewSet,
    FAQViewSet,
    GalleryItemViewSet,
    IncrementVisitView,
    JobApplicationAdminViewSet,
    JobApplicationCreateView,
    JobOfferViewSet,
    LoginView,
    PartnerViewSet,
    PropertyViewSet,
    QuoteRequestAdminViewSet,
    QuoteRequestCreateView,
    RealisationImageViewSet,
    RealisationViewSet,
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
router.register("realisations", RealisationViewSet, basename="realisation")
router.register("realisation-images", RealisationImageViewSet, basename="realisation-image")
router.register("articles", ArticleViewSet, basename="article")
router.register("faqs", FAQViewSet, basename="faq")
router.register("quote-requests", QuoteRequestAdminViewSet, basename="quote-request-admin")

urlpatterns = [
    path("auth/login/", LoginView.as_view(), name="admin-login"),
    path("settings/", SiteSettingsView.as_view(), name="site-settings"),
    path("contact/", ContactMessageCreateView.as_view(), name="contact-create"),
    path("applications/", JobApplicationCreateView.as_view(), name="application-create"),
    path("devis/", QuoteRequestCreateView.as_view(), name="quote-request-create"),
    path("visit/", IncrementVisitView.as_view(), name="visit-increment"),
    path("", include(router.urls)),
]
