from rest_framework.decorators import api_view,permission_classes
from rest_framework.response import Response
from .models import StudentProfile
from .serializers import StudentProfileSerializers
from rest_framework.permissions import IsAdminUser
from rest_framework import status
from django.shortcuts import get_object_or_404

# Create your views here.

@api_view(['Get'])
def student_list(request):
    students = StudentProfile.objects.all()
    serializers = StudentProfileSerializers(students, many=True)
    return Response(serializers.data)

@api_view(["DELETE"])
@permission_classes([IsAdminUser])
def delete_student(request, pk):
    student = get_object_or_404(StudentProfile, pk=pk)

    student.user.delete()

    return Response(
        {"message": "Student deleted successfully."},
        status=status.HTTP_200_OK
    )
