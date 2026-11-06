
from rest_framework import serializers
from .models import Course, Enrollment, Lesson


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
            "difficulty_level",
            "duration_hours",
            "learning_objectives",
            "thumbnail",
            "video_file",
            "youtube_url",
            "rejection_reason",
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
            "rejection_reason",
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


class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = [
            "id",
            "course",
            "title",
            "description",
            "video_file",
            "youtube_url",
            "order",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def validate(self, attrs):
        video_file = attrs.get(
            "video_file",
            getattr(self.instance, "video_file", None),
        )

        youtube_url = attrs.get(
            "youtube_url",
            getattr(self.instance, "youtube_url", ""),
        )

        if not video_file and not youtube_url:
            raise serializers.ValidationError(
                "Provide either a video upload or a YouTube URL."
            )

        if video_file and youtube_url:
            raise serializers.ValidationError(
                "Choose either a video upload or a YouTube URL, not both."
            )

        return attrs
