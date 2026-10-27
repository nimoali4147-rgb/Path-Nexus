from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import BasePermission, IsAuthenticated
from rest_framework.response import Response

from users.permissions import IsPlatformAdmin
from .models import TeacherProfile
from .serializers import TeacherProfileSerializer


# only teachers can access their profile
class IsTeacherUser(BasePermission):
    message = "Only teachers can access this profile."

    def has_permission(self, request, view):
        profile = getattr(request.user, "profile", None)

        return (
            request.user.is_authenticated
            and profile is not None
            and profile.role == "teacher"
        )


# teacher own profile
class TeacherOwnProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = TeacherProfileSerializer
    permission_classes = [IsAuthenticated, IsTeacherUser]

    def get_queryset(self):
        return TeacherProfile.objects.filter(user=self.request.user)

    def get_object(self):
        return get_object_or_404(self.get_queryset())


# list teachers
@api_view(["GET"])
@permission_classes([IsPlatformAdmin])
def teacher_list(request):
    teachers = TeacherProfile.objects.select_related("user").all()
    serializer = TeacherProfileSerializer(teachers, many=True)

    return Response(serializer.data)


# verify teacher
@api_view(["PATCH"])
@permission_classes([IsPlatformAdmin])
def verify_teacher(request, pk):
    teacher = get_object_or_404(TeacherProfile, pk=pk)
    teacher.is_verified = True
    teacher.save(update_fields=["is_verified"])

    return Response({
        "message": "Teacher verified successfully.",
        "teacher": TeacherProfileSerializer(teacher).data,
    })


# reject teacher
@api_view(["PATCH"])
@permission_classes([IsPlatformAdmin])
def reject_teacher(request, pk):
    teacher = get_object_or_404(TeacherProfile, pk=pk)
    teacher.is_verified = False
    teacher.save(update_fields=["is_verified"])

    return Response({
        "message": "Teacher verification rejected.",
        "teacher": TeacherProfileSerializer(teacher).data,
    })


# delete teacher
@api_view(["DELETE"])
@permission_classes([IsPlatformAdmin])
def delete_teacher(request, pk):
    teacher = get_object_or_404(
        TeacherProfile.objects.select_related("user"), pk=pk
    )
    username = teacher.user.username

    with transaction.atomic():
        teacher.user.delete()

    return Response(
        {"message": f"'{username}' deleted successfully."},
        status=status.HTTP_200_OK,
    )
