
from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import BasePermission
from rest_framework.response import Response

from .models import TeacherProfile
from .serializers import TeacherProfileSerializer


class IsSuperAdmin(BasePermission):
    message = "Only a superadmin can perform this action."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.is_superuser
        )


@api_view(["GET"])
def teacher_list(request):
    teachers = TeacherProfile.objects.select_related("user").all()
    serializer = TeacherProfileSerializer(teachers, many=True)
    return Response(serializer.data)


@api_view(["PATCH"])
@permission_classes([IsSuperAdmin])
def verify_teacher(request, pk):
    teacher = get_object_or_404(TeacherProfile, pk=pk)

    teacher.is_verified = True
    teacher.save(update_fields=["is_verified"])

    return Response({
        "message": "Teacher verified successfully.",
        "teacher": TeacherProfileSerializer(teacher).data,
    })


@api_view(["PATCH"])
@permission_classes([IsSuperAdmin])
def reject_teacher(request, pk):
    teacher = get_object_or_404(TeacherProfile, pk=pk)

    teacher.is_verified = False
    teacher.save(update_fields=["is_verified"])

    return Response({
        "message": "Teacher verification rejected.",
        "teacher": TeacherProfileSerializer(teacher).data,
    })


@api_view(["DELETE"])
@permission_classes([IsSuperAdmin])
def delete_teacher(request, pk):
    teacher = get_object_or_404(
        TeacherProfile.objects.select_related("user"),
        pk=pk,
    )

    username = teacher.user.username

    with transaction.atomic():
        teacher.user.delete()

    return Response({
        "message": f"'{username}' deleted successfully.",
    }, status=status.HTTP_200_OK)
