from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import TeacherProfile
from .serializers import TeacherProfileSerializer


@api_view(['GET'])
def teacher_list(request):
    teachers = TeacherProfile.objects.all()
    serializer = TeacherProfileSerializer(teachers, many=True)
    return Response(serializer.data)