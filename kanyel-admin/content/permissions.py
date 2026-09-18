from rest_framework import permissions

from .models import AdminProfile


class DenyReceptionRole(permissions.BasePermission):
    """Blocks the "reception" admin role from content-management endpoints
    (activities, properties, testimonials, settings, etc.). Has no effect
    on anonymous public reads or on the "full" role — combine with
    IsAuthenticatedOrReadOnly/IsAuthenticated as usual."""

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return True
        profile = getattr(user, "admin_profile", None)
        if profile and profile.role == AdminProfile.ROLE_RECEPTION:
            return False
        return True


class IsFullAdmin(permissions.BasePermission):
    """Only accounts with the "full" role (or a superuser with no profile
    yet) may manage other admin accounts."""

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        profile = getattr(user, "admin_profile", None)
        if profile is None:
            return user.is_superuser
        return profile.role == AdminProfile.ROLE_FULL
