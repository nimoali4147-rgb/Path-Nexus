
from rest_framework import serializers
from .models import Course, Enrollment


class CourseSerializer(serializers.ModelSerializer):
    teacher_username = serializers.CharField(
        source="teacher.username",
        read_only=True,
    )

    class Meta:
        model = Course
        fields = [
            "id",
            "title",
            "description",
            "category",
            "teacher",
            "teacher_username",
            "price",
            "is_free",
            "status",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "teacher",
            "teacher_username",
            "status",
            "created_at",
        ]

    def validate(self, attrs):
        is_free = attrs.get(
            "is_free",
            getattr(self.instance, "is_free", True),
        )
        price = attrs.get(
            "price",
            getattr(self.instance, "price", 0),
        )

        if is_free and price != 0:
            raise serializers.ValidationError(
                {"price": "A free course must have a price of 0."}
            )

        if not is_free and price <= 0:
            raise serializers.ValidationError(
                {"price": "A paid course must have a price above 0."}
            )

        return attrs


class EnrollmentSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(
        source="course.title",
        read_only=True,
    )

    class Meta:
        model = Enrollment
        fields = [
            "id",
            "course",
            "course_title",
            "enrolled_at",
        ]
        read_only_fields = ["id", "enrolled_at"]
