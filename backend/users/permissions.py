from rest_framework.permissions import BasePermission


def is_platform_admin(user):
    return (
        user.is_authenticated
        and (
            user.is_staff
            or user.is_superuser
            or user.role == "admin"
        )
    )


class IsPlatformAdmin(BasePermission):
    message = "Only a platform admin can perform this action."

    def has_permission(self, request, view):
        return is_platform_admin(request.user)