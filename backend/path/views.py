from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import generics
from rest_framework.permissions import AllowAny
from .serializers import RegisterSerializer

@api_view(['GET'])
def home_api(request):
    return Response({
        "message": "Welcome to Path Nexus API!",
        "status": "success",
        "platform": "Online Learning Platform"
    }) 

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]