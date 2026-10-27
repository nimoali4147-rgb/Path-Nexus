from django.contrib.auth import get_user_model, authenticate
from django.db import transaction
from rest_framework import serializers
from students.models import StudentProfile
from teachers.models import TeacherProfile
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.tokens import RefreshToken


User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    role = serializers.ChoiceField(
        choices=[
            ("student", "Student"),
            ("teacher", "Teacher"),
        ],
        write_only=True,
    )

    password = serializers.CharField(
        write_only=True,
        min_length=8
    )

    class Meta:
        model = User
        fields = ["username", "email", "password", "role"]

    @transaction.atomic
    def create(self, validated_data):
        role = validated_data.pop("role")
        password = validated_data.pop("password")

        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=password,
            role=role,
        )

        if role == "student":
            StudentProfile.objects.create(user=user)

        elif role == "teacher":
            TeacherProfile.objects.create(user=user)

        return user

    def to_representation(self, instance):
        return {
            "id": instance.id,
            "username": instance.username,
            "email": instance.email,
            "role": instance.role,
        }

class EmailLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs["email"]
        password = attrs["password"]

        user = User.objects.filter(email__iexact=email).first()

        if user is None:
            raise AuthenticationFailed("Invalid email or password.")

        user = authenticate(
            request=self.context.get("request"),
            username=user.get_username(),
            password=password,
        )

        if user is None:
            raise AuthenticationFailed("Invalid email or password.")

        if not user.is_active:
            raise AuthenticationFailed("This account is inactive.")

        refresh = RefreshToken.for_user(user)

        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }
