
from django.conf import settings
from django.db import models
from django.db.models import Q
from django.core.validators import MinValueValidator
from cloudinary_storage.storage import (
    MediaCloudinaryStorage,
    VideoMediaCloudinaryStorage,
)


class Course(models.Model):
    class Status(models.TextChoices):
        DRAFT = "DRAFT", "Draft"
        PENDING = "PENDING", "Pending"
        PUBLISHED = "PUBLISHED", "Published"
        REJECTED = "REJECTED", "Rejected"

    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=100)

    difficulty_level = models.CharField(
        max_length=20,
        default="BEGINNER"
    )

    duration_hours = models.IntegerField(
        null=True,
        blank=True
    )

    learning_objectives = models.TextField(
        default=""
    )

    thumbnail = models.ImageField(
        upload_to="course_thumbnails/",
        storage=MediaCloudinaryStorage(),
        null=True,
        blank=True
    )

    video_file = models.FileField(
        upload_to="course_videos/",
        storage=VideoMediaCloudinaryStorage(),
        null=True,
        blank=True
    )

    youtube_url = models.URLField(
        blank=True,
        default=""
    )
    rejection_reason = models.TextField(
        blank=True,
        default=""
    )

    teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="created_courses",
    )

    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)],
    )
    is_free = models.BooleanField(default=True)

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT,
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.CheckConstraint(
                condition=(
                    Q(is_free=True, price=0)
                    | Q(is_free=False, price__gt=0)
                ),
                name="course_free_price_consistent",
            ),
        ]

    def __str__(self):
        return self.title


class Enrollment(models.Model):
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="course_enrollments",
    )

    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="enrollments",
    )

    enrolled_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-enrolled_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["student", "course"],
                name="unique_student_course_enrollment",
            ),
        ]

    def __str__(self):
        return f"{self.student} - {self.course}"


class Lesson(models.Model):
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="lessons"
    )

    title = models.CharField(max_length=200)

    description = models.TextField(blank=True)

    video_file = models.FileField(
        upload_to="lesson_videos/",
        storage=VideoMediaCloudinaryStorage(),
        null=True,
        blank=True
    )

    youtube_url = models.URLField(
        blank=True,
        default=""
    )

    order = models.PositiveIntegerField(default=1)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["order"]
        db_table = "courses_course_lesson"

    def __str__(self):
        return self.title
