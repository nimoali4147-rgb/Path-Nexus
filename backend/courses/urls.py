
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    CourseViewSet,
    LessonViewSet,
    EnrollmentListCreateView,
    EnrollmentDeleteView,
    EnrollmentProgressView,
    TeacherStudentsListView,
)

router = DefaultRouter()

router.register("courses", CourseViewSet, basename="course")
router.register("lessons", LessonViewSet, basename="lesson")

urlpatterns = [
    path("", include(router.urls)),

    path(
        "enrollments/",
        EnrollmentListCreateView.as_view(),
        name="enrollment-list-create",
    ),

    path(
        "enrollments/<int:pk>/",
        EnrollmentDeleteView.as_view(),
        name="enrollment-delete",
    ),
    path(
        "enrollments/<int:pk>/progress/",
        EnrollmentProgressView.as_view(),
        name="enrollment-progress",
    ),
    path(
        "teacher/students/",
        TeacherStudentsListView.as_view({"get": "list"}),
        name="teacher-students",
    ),


]
