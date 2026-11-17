from rest_framework import permissions

from .models import AdminProfile


class DenyReceptionRole(permissions.BasePermission):
    """Interdit au rôle admin « reception » les endpoints de gestion de contenu
    (activités, biens, témoignages, paramètres, etc.). Sans effet sur les
    lectures publiques anonymes ni sur le rôle « full » — à combiner avec
    IsAuthenticatedOrReadOnly/IsAuthenticated comme d'habitude."""

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return True
        profile = getattr(user, "admin_profile", None)
        if profile and profile.role == AdminProfile.ROLE_RECEPTION:
            return False
        return True


class IsFullAdmin(permissions.BasePermission):
    """Seuls les comptes au rôle « full » (ou un superuser encore sans profil)
    peuvent gérer les autres comptes admin."""

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        profile = getattr(user, "admin_profile", None)
        if profile is None:
            return user.is_superuser
        return profile.role == AdminProfile.ROLE_FULL
