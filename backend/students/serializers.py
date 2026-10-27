from rest_framework import serializers
from .models import StudentProfile


class StudentProfileSerializers(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = StudentProfile
        fields = ["id", "user", "username", "bio", "created_at"]
        read_only_fields = ["id", "user", "username", "created_at"]
