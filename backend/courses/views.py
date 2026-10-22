
from django.shortcuts import get_object_or_404
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.generics import ListCreateAPIView, DestroyAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import Course, Enrollment
from .serializers import CourseSerializer, EnrollmentSerializer
from .permissions import (
    IsTeacher,
    IsStudent,
    IsCourseOwnerOrAdmin,
    is_admin,
)


class IsAdminUser(IsAuthenticated):
    def has_permission(self, request, view):
        return (
            super().has_permission(request, view)
            and is_admin(request.user)
        )


class CourseViewSet(viewsets.ModelViewSet):
    serializer_class = CourseSerializer

    def get_queryset(self):
        user = self.request.user

        if user.is_authenticated and is_admin(user):
            return Course.objects.all()

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
            )

        return Course.objects.filter(
                status=Course.Status.PUBLISHED
            )

def get_permissions(self):
    if self.action in ["list", "retrieve"]:
        return [AllowAny()]

    if self.action in ["approve", "reject"]:
        return [IsAdminUser()]

    if self.action == "create":
        return [IsTeacher()]

    if self.action in ["submit", "update", "partial_update", "destroy"]:
        return [IsAuthenticated(), IsCourseOwnerOrAdmin()]

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
                "Only draft courses can be edited. "
                "A rejected course must be returned to draft first."
            )

        return super().update(request, *args, **kwargs)

def destroy(self, request, *args, **kwargs):
    course = self.get_object()

    allowed_statuses = [
        Course.Status.DRAFT,
        Course.Status.REJECTED,
    ]

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
            CourseSerializer(course).data,
            status=status.HTTP_200_OK,
        )

    @action(
        detail=True,
        methods=["patch"],
        permission_classes=[IsAdminUser],
    )
    def approve(self, request, pk=None):
        course = self.get_object()

        if course.status != Course.Status.PENDING:
            raise ValidationError(
                "Only pending courses can be approved."
            )

        course.status = Course.Status.PUBLISHED
        course.save(update_fields=["status"])

        return Response(CourseSerializer(course).data)

    @action(
        detail=True,
        methods=["patch"],
        permission_classes=[IsAdminUser],
    )
    def reject(self, request, pk=None):
        course = self.get_object()

        if course.status != Course.Status.PENDING:
            raise ValidationError(
                "Only pending courses can be rejected."
            )

        course.status = Course.Status.REJECTED
        course.save(update_fields=["status"])

        return Response(CourseSerializer(course).data)


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

        # Until payment verification is implemented,
        # students can enroll in free courses only.
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
        return Enrollment.objects.filter(
            student=self.request.user
        )
