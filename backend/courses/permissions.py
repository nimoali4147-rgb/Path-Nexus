from rest_framework.permissions import BasePermission


def get_role(user):
    if not user.is_authenticated:
        return None

    profile = getattr(user, "profile", None)

    if profile is None:
        return None

    return profile.role


def is_admin(user):
    return (
        user.is_authenticated
        and (
            user.is_staff
            or get_role(user) == "admin"
        )
    )


class IsTeacher(BasePermission):
    def has_permission(self, request, view):
        return get_role(request.user) == "teacher"


class IsStudent(BasePermission):
    def has_permission(self, request, view):
        return get_role(request.user) == "student"


class IsCourseOwnerOrAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        return (
            is_admin(request.user)
            or obj.teacher_id == request.user.id
        )