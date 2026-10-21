from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(['GET'])
def home_api(request):
    return Response({
        "message": "Welcome to Path Nexus API!",
        "status": "success",
        "platform": "Online Learning Platform"
    }) 