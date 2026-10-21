from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import StudentProfile
from .serializers import StudentProfileSerializers


# Create your views here.

@api_view(['Get'])
def student_list(request):
    students = StudentProfile.objects.all()
    serializers = StudentProfileSerializers(students, many=True)
    return Response(serializers.data)

