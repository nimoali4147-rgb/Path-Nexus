from rest_framework import serializers
from .models import TeacherProfile


class TeacherProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = TeacherProfile
        fields = [
            "id", "user", "username", "email", "bio", "qualifications",
            "is_verified", "verification_status", "created_at",
        ]
        read_only_fields = [
            "id", "user", "username", "is_verified", "verification_status", "created_at",
        ]
