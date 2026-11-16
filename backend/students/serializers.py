
from rest_framework import serializers
from .models import StudentProfile


class StudentProfileSerializers(serializers.ModelSerializer):
    username = serializers.CharField(
        source="user.username",
        read_only=True
    )
    email = serializers.EmailField(
        source="user.email",
        read_only=True
    )
    role = serializers.CharField(
        source="user.role",
        read_only=True
    )
    account_status = serializers.CharField(
        source="user.account_status",
        read_only=True
    )

    class Meta:
        model = StudentProfile
        fields = [
            "id",
            "user",
            "username",
            "email",
            "role",
            "account_status",
            "bio",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "user",
            "username",
            "email",
            "role",
            "account_status",
            "created_at",
        ]
