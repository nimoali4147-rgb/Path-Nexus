from django.contrib.auth.models import User
from django.db import transaction
from rest_framework import serializers
from .models import UserProfile
from students.models import StudentProfile
from teachers.models import TeacherProfile


class RegisterSerializer(serializers.ModelSerializer):
    role = serializers.ChoiceField(
        choices=[("student", "Student"), ("teacher", "Teacher")],
        write_only=True,
    )
    password = serializers.CharField(write_only=True, min_length=8)


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
            password=password
        )

        UserProfile.objects.create(
            user=user,
            role=role
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
            "role": instance.profile.role
        }
