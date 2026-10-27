from rest_framework import generics
from rest_framework.permissions import AllowAny
from .serializers import RegisterSerializer,  EmailLoginSerializer
from rest_framework_simplejwt.views import TokenObtainPairView


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

class EmailLoginView(TokenObtainPairView):
    serializer_class = EmailLoginSerializer