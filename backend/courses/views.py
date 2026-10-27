
from django.shortcuts import get_object_or_404

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.generics import ListCreateAPIView, DestroyAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from path.permissions import IsPlatformAdmin
from rest_framework.response import Response

from .models import Course, Enrollment
from .serializers import CourseSerializer, EnrollmentSerializer
from .permissions import (
    IsTeacher,
    IsStudent,
    IsCourseOwnerOrAdmin,
    is_admin,
)


class CourseViewSet(viewsets.ModelViewSet):
    serializer_class = CourseSerializer

    def get_queryset(self):
        user = self.request.user

        # Admins can see all courses.
        if user.is_authenticated and is_admin(user):
            return Course.objects.all()

        # Teachers can see their own courses and all published courses.
        if (
            user.is_authenticated
            and getattr(
                getattr(user, "profile", None),
                "role",
                None,
            ) == "teacher"
        ):
            return (
                Course.objects.filter(teacher=user)
                | Course.objects.filter(
                    status=Course.Status.PUBLISHED
                )
            ).distinct()

        # Students and any visitors see published courses only.
        return Course.objects.filter(
            status=Course.Status.PUBLISHED
        )

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]

        if self.action in ["approve", "reject"]:
            return [IsPlatformAdmin()]

        if self.action == "create":
            return [IsTeacher()]

        if self.action in [
            "submit",
            "update",
            "destroy",
        ]:
            return [
                IsAuthenticated(),
                IsCourseOwnerOrAdmin(),
            ]

        return [IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(
            teacher=self.request.user,
            status=Course.Status.DRAFT,
        )

    def update(self, request, *args, **kwargs):
        course = self.get_object()

        if course.status != Course.Status.DRAFT:
            raise ValidationError(
                "Only draft courses can be edited."
            )

        return super().update(request, *args, **kwargs)


    def destroy(self, request, *args, **kwargs):
        course = self.get_object()

        allowed_statuses = [
            Course.Status.DRAFT,
            Course.Status.REJECTED,

        ]

        if is_admin(request.user):
            return super().destroy(request, *args, **kwargs)

        if course.status not in allowed_statuses:
            raise ValidationError(
                "Only draft or rejected courses can be deleted."
            )

        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=["post"])
    def submit(self, request, pk=None):
        course = self.get_object()

        if course.teacher_id != request.user.pk:
            raise PermissionDenied(
                "You can submit only your own course."
            )

        if course.status != Course.Status.DRAFT:
            raise ValidationError(
                "Only draft courses can be submitted."
            )

        course.status = Course.Status.PENDING
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
    def reject(self, request, pk=None):
        course = self.get_object()

        if course.status != Course.Status.PENDING:
            raise ValidationError(
                "Only pending courses can be rejected."
            )

        course.status = Course.Status.REJECTED
        course.save(update_fields=["status"])

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

        # Paid-course access remains blocked until payment is verified.
        if not course.is_free:
            raise ValidationError(
                "This is a paid course. Payment must be "
                "implemented and verified before enrollment."
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
        # Students can delete only their own enrollments.
        return Enrollment.objects.filter(
            student=self.request.user
        )
