
from django.db import models
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.generics import ListCreateAPIView, DestroyAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from users.permissions import IsPlatformAdmin
from .models import Course, Enrollment, Lesson
from .serializers import (
    CourseSerializer,
    EnrollmentSerializer,
    LessonSerializer,
)
from .permissions import (
    IsTeacher,
    IsStudent,
    IsCourseOwnerOrAdmin,
    IsLessonOwnerOrAdmin,
    is_admin,
)


class CourseViewSet(viewsets.ModelViewSet):
    serializer_class = CourseSerializer

    def get_queryset(self):
        user = self.request.user

        if user.is_authenticated and is_admin(user):
            return Course.objects.all()

        if user.is_authenticated and user.role == "teacher":
            return Course.objects.filter(teacher=user)

        if user.is_authenticated:
            return Course.objects.filter(
                models.Q(status=Course.Status.PUBLISHED)
                | models.Q(enrollments__student=user)
            ).distinct()

        return Course.objects.filter(status=Course.Status.PUBLISHED)

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]

        if self.action in ["approve", "reject"]:
            return [IsPlatformAdmin()]

        if self.action == "create":
            return [IsTeacher()]

        if self.action in [
            "submit",
            "unpublish",
            "republish",
            "update",
            "partial_update",
            "destroy",
        ]:
            return [IsAuthenticated(), IsCourseOwnerOrAdmin()]

        return [IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(
            teacher=self.request.user,
            status=Course.Status.DRAFT,
        )

    def update(self, request, *args, **kwargs):
        course = self.get_object()

        editable_statuses = [
            Course.Status.DRAFT,
            Course.Status.REJECTED,
            Course.Status.PUBLISHED,
            Course.Status.UNPUBLISHED,
        ]

        if course.status not in editable_statuses:
            raise ValidationError(
                "This course cannot be edited while it is pending approval."
            )

        return super().update(request, *args, **kwargs)

        def destroy(self, request, *args, **kwargs):
            course = self.get_object()

            if (
                course.teacher_id != request.user.id
                and not is_admin(request.user)
            ):
                raise PermissionDenied(
                    "You can delete only your own course."
                )

            if course.enrollments.exists():
                raise ValidationError(
                    "Students are enrolled in this course. Unpublish it instead."
                )

            return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=["post"])
    def submit(self, request, pk=None):
        course = self.get_object()

        if course.teacher_id != request.user.pk:
            raise PermissionDenied("You can submit only your own course.")

        if course.status not in [
            Course.Status.DRAFT,
            Course.Status.REJECTED,
        ]:
            raise ValidationError(
                "Only draft or rejected courses can be submitted."
            )

        course.status = Course.Status.PENDING
        course.rejection_reason = ""
        course.save(update_fields=["status", "rejection_reason"])

        return Response(
            CourseSerializer(
                course,
                context=self.get_serializer_context(),
            ).data,
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["post"])
    def unpublish(self, request, pk=None):
        course = self.get_object()

        if (
            course.teacher_id != request.user.pk
            and not is_admin(request.user)
        ):
            raise PermissionDenied(
                "You can unpublish only your own course."
            )

        if course.status != Course.Status.PUBLISHED:
            raise ValidationError(
                "Only published courses can be unpublished."
            )

        course.status = Course.Status.UNPUBLISHED
        course.save(update_fields=["status"])

        return Response(
            CourseSerializer(
                course,
                context=self.get_serializer_context(),
            ).data,
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["post"])
    def republish(self, request, pk=None):
        course = self.get_object()

        if (
            course.teacher_id != request.user.pk
            and not is_admin(request.user)
        ):
            raise PermissionDenied(
                "You can republish only your own course."
            )

        if course.status != Course.Status.UNPUBLISHED:
            raise ValidationError(
                "Only unpublished courses can be republished."
            )

        course.status = Course.Status.PUBLISHED
        course.save(update_fields=["status"])

        return Response(
            CourseSerializer(
                course,
                context=self.get_serializer_context(),
            ).data,
            status=status.HTTP_200_OK,
        )

    @action(
        detail=True,
        methods=["patch"],
        permission_classes=[IsPlatformAdmin],
    )
    def approve(self, request, pk=None):
        course = self.get_object()

        if course.status != Course.Status.PENDING:
            raise ValidationError(
                "Only pending courses can be approved."
            )

        course.status = Course.Status.PUBLISHED
        course.rejection_reason = ""
        course.save(update_fields=["status", "rejection_reason"])

        return Response(
            CourseSerializer(
                course,
                context=self.get_serializer_context(),
            ).data,
            status=status.HTTP_200_OK,
        )

    @action(
        detail=True,
        methods=["patch"],
        permission_classes=[IsPlatformAdmin],
    )
    def reject(self, request, pk=None):
        course = self.get_object()

        if course.status != Course.Status.PENDING:
            raise ValidationError(
                "Only pending courses can be rejected."
            )

        course.status = Course.Status.REJECTED
        course.rejection_reason = request.data.get(
            "rejection_reason",
            "",
        )
        course.save(update_fields=["status", "rejection_reason"])

        return Response(
            CourseSerializer(
                course,
                context=self.get_serializer_context(),
            ).data,
            status=status.HTTP_200_OK,
        )


class EnrollmentListCreateView(ListCreateAPIView):
    serializer_class = EnrollmentSerializer
    permission_classes = [IsStudent]

    def get_queryset(self):
        return Enrollment.objects.filter(
            student=self.request.user
        ).select_related("course")

    def perform_create(self, serializer):
        course_id = self.request.data.get("course")

        course = get_object_or_404(
            Course,
            pk=course_id,
            status=Course.Status.PUBLISHED,
        )

        if not course.is_free:
            raise ValidationError(
                "This is a paid course. Payment must be implemented "
                "and verified before enrollment."
            )

        if Enrollment.objects.filter(
            student=self.request.user,
            course=course,
        ).exists():
            raise ValidationError(
                "You are already enrolled in this course."
            )

        serializer.save(
            student=self.request.user,
            course=course,
        )


class EnrollmentDeleteView(DestroyAPIView):
    serializer_class = EnrollmentSerializer
    permission_classes = [IsStudent]

    def get_queryset(self):
        return Enrollment.objects.filter(
            student=self.request.user
        )


class EnrollmentProgressView(APIView):
    permission_classes = [IsStudent]

    def get_enrollment(self, request, pk):
        return get_object_or_404(
            Enrollment.objects.select_related("course"),
            pk=pk,
            student=request.user,
        )

    def build_response(self, enrollment):
        course = enrollment.course
        lessons = course.lessons.all().order_by("order", "id")
        completed_ids = list(
            enrollment.completed_lessons
            .filter(course=course)
            .values_list("id", flat=True)
        )

        total = lessons.count()
        completed_count = len(completed_ids)

        return {
            "id": enrollment.id,
            "course": CourseSerializer(course).data,
            "lessons": LessonSerializer(lessons, many=True).data,
            "completed_lesson_ids": completed_ids,
            "lesson_count": total,
            "completed_lessons_count": completed_count,
            "progress_percent": round(
                completed_count / total * 100, 2
            ) if total else 0,
            "completed_at": enrollment.completed_at,
        }

    def get(self, request, pk):
        enrollment = self.get_enrollment(request, pk)
        return Response(self.build_response(enrollment))

    def post(self, request, pk):
        enrollment = self.get_enrollment(request, pk)
        lesson_id = request.data.get("lesson_id")
        completed = request.data.get("completed", True)

        if lesson_id is not None:
            lesson = get_object_or_404(
                Lesson,
                pk=lesson_id,
                course=enrollment.course,
            )

            if completed:
                enrollment.completed_lessons.add(lesson)
            else:
                enrollment.completed_lessons.remove(lesson)
        else:
            raise ValidationError(
                "A lesson_id is required to update lesson progress."
            )

        total = enrollment.course.lessons.count()
        completed_count = enrollment.completed_lessons.filter(
            course=enrollment.course
        ).count()

        enrollment.completed_at = (
            timezone.now()
            if total > 0 and completed_count >= total
            else None
        )

        enrollment.last_accessed_at = timezone.now()
        enrollment.save(
            update_fields=["completed_at", "last_accessed_at"]
        )

        return Response(self.build_response(enrollment))


class LessonViewSet(viewsets.ModelViewSet):
    serializer_class = LessonSerializer

    def get_queryset(self):
        user = self.request.user

        if user.is_authenticated and is_admin(user):
            return Lesson.objects.all().select_related("course")

        if user.is_authenticated and user.role == "teacher":
            return Lesson.objects.filter(
                course__teacher=user
            ).select_related("course")

        if user.is_authenticated:
            return Lesson.objects.filter(
                models.Q(course__status=Course.Status.PUBLISHED)
                | models.Q(course__enrollments__student=user)
            ).distinct().select_related("course")

        return Lesson.objects.filter(
            course__status=Course.Status.PUBLISHED
        ).select_related("course")

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]

        if self.action == "create":
            return [IsAuthenticated(), IsTeacher()]

        if self.action in ["complete", "start"]:
            return [IsAuthenticated(), IsStudent()]

        return [IsAuthenticated(), IsLessonOwnerOrAdmin()]

    def perform_create(self, serializer):
        course_id = self.request.data.get("course")

        course = get_object_or_404(
            Course,
            id=course_id,
            teacher=self.request.user,
        )

        allowed_statuses = [
            Course.Status.DRAFT,
            Course.Status.REJECTED,
            Course.Status.PUBLISHED,
            Course.Status.UNPUBLISHED,
        ]

        if course.status not in allowed_statuses:
            raise ValidationError(
                "Lessons cannot be added while the course is pending review."
            )

        serializer.save(course=course)

    @action(detail=True, methods=["post"])
    def start(self, request, pk=None):
        lesson = self.get_object()

        enrollment = get_object_or_404(
            Enrollment,
            student=request.user,
            course=lesson.course,
        )

        enrollment.last_accessed_at = timezone.now()
        enrollment.save(update_fields=["last_accessed_at"])

        return Response(
            EnrollmentSerializer(enrollment).data,
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["post"])
    def complete(self, request, pk=None):
        lesson = self.get_object()

        enrollment = get_object_or_404(
            Enrollment,
            student=request.user,
            course=lesson.course,
        )

        enrollment.completed_lessons.add(lesson)
        enrollment.last_accessed_at = timezone.now()

        total_lessons = lesson.course.lessons.count()
        completed_count = enrollment.completed_lessons.filter(
            course=lesson.course
        ).count()

        if total_lessons > 0 and completed_count >= total_lessons:
            enrollment.completed_at = timezone.now()
        else:
            enrollment.completed_at = None

        enrollment.save(
            update_fields=["last_accessed_at", "completed_at"]
        )

        return Response(
            EnrollmentSerializer(enrollment).data,
            status=status.HTTP_200_OK,
        )


class TeacherStudentsListView(viewsets.ViewSet):
    permission_classes = [IsAuthenticated, IsTeacher]

    def list(self, request):
        enrollments = Enrollment.objects.filter(
            course__teacher=request.user
        ).select_related(
            "student",
            "course",
        ).order_by("-enrolled_at")

        data = []

        for enrollment in enrollments:
            student = enrollment.student

            data.append({
                "id": enrollment.id,
                "student_name": (
                    student.get_full_name() or student.username
                ),
                "student_email": student.email,
                "course_title": enrollment.course.title,
                "enrolled_at": enrollment.enrolled_at,
            })

        return Response(data)
