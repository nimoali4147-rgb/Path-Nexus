from rest_framework.permissions import BasePermission
from users.permissions import is_platform_admin


def get_role(user):
    if not user.is_authenticated:
        return None

    profile = getattr(user, "profile", None)
    if profile is None:
        return None

    return profile.role


def is_admin(user):
    return is_platform_admin(user)


def is_verified_teacher(user):
    if not user.is_authenticated or get_role(user) != "teacher":
        return False

    teacher_profile = getattr(user, "teacher_profile", None)
    return teacher_profile is not None and teacher_profile.is_verified


class IsTeacher(BasePermission):
    message = "Only a verified teacher can perform this action."

    def has_permission(self, request, view):
        return is_verified_teacher(request.user)


class IsStudent(BasePermission):
    message = "Only students can perform this action."

    def has_permission(self, request, view):
        return get_role(request.user) == "student"


class IsCourseOwnerOrAdmin(BasePermission):
    message = "Only the course owner or a platform admin can perform this action."

    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            is_admin(request.user) or is_verified_teacher(request.user)
        )

    def has_object_permission(self, request, view, obj):
        return is_admin(request.user) or obj.teacher_id == request.user.id
