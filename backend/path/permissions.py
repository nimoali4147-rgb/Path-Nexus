from rest_framework.permissions import BasePermission


def is_platform_admin(user):
    """Return True for trusted platform admins and Django staff users."""
    if not user.is_authenticated:
        return False

    if user.is_staff or user.is_superuser:
        return True

    profile = getattr(user, "profile", None)
    return profile is not None and profile.role == "admin"


class IsPlatformAdmin(BasePermission):
    message = "Only a platform admin can perform this action."

    def has_permission(self, request, view):
        return is_platform_admin(request.user)
