from django.shortcuts import get_object_or_404
from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import BasePermission, IsAuthenticated
from rest_framework.response import Response

from users.permissions import IsPlatformAdmin
from .models import StudentProfile
from .serializers import StudentProfileSerializers


# only students can access their profile
class IsStudentUser(BasePermission):
    message = "Only students can access this profile."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == "student"
        )

# list students
@api_view(["GET"])
@permission_classes([IsPlatformAdmin])
def student_list(request):
    students = StudentProfile.objects.select_related("user").all()
    serializer = StudentProfileSerializers(students, many=True)

    return Response(serializer.data)


# student own profile
class StudentOwnProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = StudentProfileSerializers
    permission_classes = [IsAuthenticated, IsStudentUser]

    def get_queryset(self):
        return StudentProfile.objects.filter(user=self.request.user)

    def get_object(self):
        return get_object_or_404(self.get_queryset())


# delete student
@api_view(["DELETE"])
@permission_classes([IsPlatformAdmin])
def delete_student(request, pk):
    student = get_object_or_404(StudentProfile, pk=pk)
    student.user.delete()

    return Response(
        {"message": "Student deleted successfully."},
        status=status.HTTP_200_OK,
    )
