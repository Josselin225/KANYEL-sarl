import os
from datetime import timedelta

from django.conf import settings
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db.models import F, Q
from django.http import FileResponse, Http404
from django.utils import timezone
from django.utils._os import safe_join
from django.views.static import serve as serve_static

from rest_framework import generics, permissions, status, views, viewsets
from rest_framework.authtoken.serializers import AuthTokenSerializer
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle

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
from .authentication import TOKEN_TTL
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
    NewsletterSubscriberCreateSerializer,
    NewsletterSubscriberSerializer,
    PartnerSerializer,
    PropertyAdminSerializer,
    PropertyImageSerializer,
    PropertySerializer,
    PropertyVisitRequestCreateSerializer,
    PropertyVisitRequestSerializer,
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
    """Enregistre qui a créé/modifié/supprimé quoi, pour la traçabilité dès
    qu'il existe plus d'un compte admin."""

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
    """Ignore silencieusement les envois de spam-bots qui remplissent un champ caché que les vrais utilisateurs ne voient jamais."""

    honeypot_field = "website"

    def create(self, request, *args, **kwargs):
        if request.data.get(self.honeypot_field):
            return Response(status=status.HTTP_201_CREATED)
        return super().create(request, *args, **kwargs)


class LoginThrottle(AnonRateThrottle):
    """Limite stricte et dédiée à l'endpoint de connexion pour freiner la devinette d'identifiants."""

    scope = "login"


class FormThrottle(AnonRateThrottle):
    """Envois de formulaires publics (chacun envoie un e-mail à l'entreprise)."""

    scope = "forms"


class SearchThrottle(AnonRateThrottle):
    scope = "search"


class VisitThrottle(AnonRateThrottle):
    scope = "visit"


class LoginView(views.APIView):
    """POST {username, password} -> {token, username}. Utilisé par le panneau /admin sur mesure."""

    permission_classes = [permissions.AllowAny]
    authentication_classes = []
    throttle_classes = [LoginThrottle]

    def post(self, request, *args, **kwargs):
        serializer = AuthTokenSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        # Ménage : supprime les sessions expirées de cet utilisateur.
        AdminToken.objects.filter(user=user, created__lt=timezone.now() - TOKEN_TTL).delete()
        # Les tokens sont stockés hachés, un token existant ne peut donc pas être
        # renvoyé — chaque connexion ouvre une nouvelle session (une par appareil/navigateur).
        key = AdminToken.issue(user)
        profile = getattr(user, "admin_profile", None)
        role = profile.role if profile else AdminProfile.ROLE_FULL
        return Response({"token": key, "username": user.username, "role": role})


class LogoutView(views.APIView):
    """Révoque le token de l'appelant côté serveur, pour que la déconnexion mette réellement fin à la session."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        # Ne termine que cette session ; les autres appareils restent connectés.
        if isinstance(request.auth, AdminToken):
            request.auth.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


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

    def get_serializer_class(self):
        return PropertyAdminSerializer if self._is_staff() else PropertySerializer

    def get_queryset(self):
        # "price" est un texte libre (ex. "25 000 000 FCFA" ou "Sur demande"), il ne
        # peut donc pas être filtré numériquement en SQL — le filtrage prix min/max
        # se fait côté client, sur la valeur numérique extraite.
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
    """Incrément du compteur (POST uniquement), appelé une fois par visiteur et par jour depuis le frontend."""

    permission_classes = [permissions.AllowAny]
    throttle_classes = [VisitThrottle]

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
    """Nombre réel de visites des 30 derniers jours, pour le graphique du tableau de bord admin."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        since = timezone.localdate() - timedelta(days=29)
        logs = VisitLog.objects.filter(date__gte=since).order_by("date")
        return Response(VisitLogSerializer(logs, many=True).data)


class SearchView(views.APIView):
    """Recherche simple sur tout le site : activités, biens, articles et réalisations."""

    permission_classes = [permissions.AllowAny]
    throttle_classes = [SearchThrottle]

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
                "url": f"/biens/{prop.id}", "excerpt": prop.location,
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
                "url": f"/realisations/{realisation.id}", "excerpt": realisation.description_fr,
            })

        return Response(results)


class AdminUserViewSet(AuditLogMixin, viewsets.ModelViewSet):
    """Gestion des comptes admin supplémentaires — réservée au rôle « full »."""

    resource_key = "admin-users"
    queryset = User.objects.all().order_by("username")
    serializer_class = AdminUserSerializer
    permission_classes = [IsFullAdmin]


class ChangeOwnPasswordView(views.APIView):
    """Permet à tout compte admin authentifié (full ou reception) de changer son
    propre mot de passe. Émet un nouveau token et révoque l'ancien, pour qu'un token
    compromis ne survive pas au seul recours qu'un utilisateur peut appliquer lui-même."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        current_password = request.data.get("current_password", "")
        new_password = request.data.get("new_password", "")

        if not request.user.check_password(current_password):
            return Response({"current_password": "Mot de passe actuel incorrect."}, status=400)
        try:
            validate_password(new_password, request.user)
        except DjangoValidationError as exc:
            return Response({"new_password": " ".join(exc.messages)}, status=400)

        request.user.set_password(new_password)
        request.user.save()
        # Déconnecte tous les appareils, puis ouvre une nouvelle session pour celui-ci.
        AdminToken.objects.filter(user=request.user).delete()
        return Response({"token": AdminToken.issue(request.user)})


class ContactMessageCreateView(HoneypotCreateMixin, generics.CreateAPIView):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageCreateSerializer
    permission_classes = [permissions.AllowAny]
    throttle_classes = [FormThrottle]

    def perform_create(self, serializer):
        instance = serializer.save()
        notify_admin(
            f"Nouveau message de {instance.name}",
            f"Sujet : {instance.subject or 'Sans objet'}\n"
            f"E-mail : {instance.email}\nTéléphone : {instance.phone}\n\n{instance.message}",
        )


class ContactMessageAdminViewSet(AuditLogMixin, viewsets.ModelViewSet):
    """Gestion, réservée aux authentifiés, des messages de contact reçus (lister/lire/marquer lu/supprimer)."""

    resource_key = "contact-messages"
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["get", "patch", "delete", "head", "options"]


class JobApplicationCreateView(HoneypotCreateMixin, generics.CreateAPIView):
    queryset = JobApplication.objects.all()
    serializer_class = JobApplicationCreateSerializer
    permission_classes = [permissions.AllowAny]
    throttle_classes = [FormThrottle]

    def perform_create(self, serializer):
        instance = serializer.save()
        job_title = instance.job.title_fr if instance.job else "Candidature spontanée"
        notify_admin(
            f"Nouvelle candidature — {job_title}",
            f"Candidat : {instance.full_name}\nE-mail : {instance.email}\nTéléphone : {instance.phone}\n\n{instance.message}",
        )


class JobApplicationAdminViewSet(AuditLogMixin, viewsets.ModelViewSet):
    """Gestion, réservée aux authentifiés, des candidatures reçues (lister/lire/marquer lu/supprimer)."""

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
    throttle_classes = [FormThrottle]

    def perform_create(self, serializer):
        instance = serializer.save()
        dept = instance.department.title_fr if instance.department else "Devis général"
        notify_admin(
            f"Nouvelle demande de devis — {dept}",
            f"Nom : {instance.full_name}\nE-mail : {instance.email}\nTéléphone : {instance.phone}\n"
            f"Budget : {instance.get_budget_display()}\nDélai : {instance.get_timeline_display()}\n\n{instance.description}",
        )


class QuoteRequestAdminViewSet(AuditLogMixin, viewsets.ModelViewSet):
    """Gestion, réservée aux authentifiés, des demandes de devis reçues (lister/lire/marquer lu/supprimer)."""

    resource_key = "quote-requests"
    queryset = QuoteRequest.objects.all()
    serializer_class = QuoteRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["get", "patch", "delete", "head", "options"]


class PropertyVisitRequestCreateView(HoneypotCreateMixin, generics.CreateAPIView):
    queryset = PropertyVisitRequest.objects.all()
    serializer_class = PropertyVisitRequestCreateSerializer
    permission_classes = [permissions.AllowAny]
    throttle_classes = [FormThrottle]

    def perform_create(self, serializer):
        instance = serializer.save()
        date_str = instance.preferred_date.strftime("%d/%m/%Y") if instance.preferred_date else "Non précisée"
        notify_admin(
            f"Nouvelle demande de visite — {instance.property.title_fr if instance.property else 'Bien supprimé'}",
            f"Nom : {instance.full_name}\nE-mail : {instance.email}\nTéléphone : {instance.phone}\n"
            f"Date souhaitée : {date_str}\n\n{instance.message}",
        )


class PropertyVisitRequestAdminViewSet(AuditLogMixin, viewsets.ModelViewSet):
    """Gestion, réservée aux authentifiés, des demandes de visite de biens reçues (lister/lire/marquer lu/supprimer)."""

    resource_key = "property-visit-requests"
    queryset = PropertyVisitRequest.objects.all()
    serializer_class = PropertyVisitRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["get", "patch", "delete", "head", "options"]


class NewsletterSubscriberCreateView(HoneypotCreateMixin, generics.CreateAPIView):
    queryset = NewsletterSubscriber.objects.all()
    serializer_class = NewsletterSubscriberCreateSerializer
    permission_classes = [permissions.AllowAny]
    throttle_classes = [FormThrottle]


class NewsletterSubscriberAdminViewSet(AuditLogMixin, viewsets.ModelViewSet):
    """Gestion, réservée aux authentifiés, des inscriptions à la newsletter."""

    resource_key = "newsletter-subscribers"
    queryset = NewsletterSubscriber.objects.all()
    serializer_class = NewsletterSubscriberSerializer
    permission_classes = [permissions.IsAuthenticated, DenyReceptionRole]
    http_method_names = ["get", "patch", "delete", "head", "options"]


class AuditLogEntryViewSet(viewsets.ReadOnlyModelViewSet):
    """Journal en lecture seule de qui a fait quoi — visible uniquement par les admins « full »."""

    queryset = AuditLogEntry.objects.all()
    serializer_class = AuditLogEntrySerializer
    permission_classes = [IsFullAdmin]


class ProtectedMediaView(views.APIView):
    """Sert les fichiers de media/applications/ (CV, lettres de motivation — données
    personnelles) au seul staff authentifié, au lieu du serveur de médias public."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, path):
        try:
            full_path = safe_join(str(settings.MEDIA_ROOT / "applications"), path)
        except ValueError:
            raise Http404
        if not os.path.isfile(full_path):
            raise Http404
        return FileResponse(open(full_path, "rb"), as_attachment=True, filename=os.path.basename(full_path))


def public_media(request, path):
    """Sert la partie publique de MEDIA_ROOT (photos du site, logos...).

    Refuse tout ce qui se résout dans media/applications/, quelle que soit la
    graphie de l'URL : `//`, `./`, `x/../`, une casse différente ou un nom court
    Windows se normalisent tous vers le même dossier, et contourneraient sinon
    la route réservée au staff ci-dessus.
    """
    media_root = os.path.realpath(settings.MEDIA_ROOT)
    private_root = os.path.normcase(os.path.realpath(os.path.join(media_root, "applications")))
    try:
        full_path = os.path.realpath(safe_join(media_root, path))
    except ValueError:
        raise Http404
    normalized = os.path.normcase(full_path)
    if normalized == private_root or normalized.startswith(private_root + os.sep):
        raise Http404
    if not os.path.isfile(full_path):
        raise Http404
    return serve_static(request, os.path.relpath(full_path, media_root), document_root=media_root)
