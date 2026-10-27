from django.urls import path
from .views import (
    teacher_list, verify_teacher, reject_teacher, delete_teacher,
    TeacherOwnProfileView,
)

urlpatterns = [
    path("", teacher_list, name="teacher-list"),
    path("me/", TeacherOwnProfileView.as_view(), name="teacher-profile-me"),
    path("<int:pk>/verify/", verify_teacher, name="verify-teacher"),
    path("<int:pk>/reject/", reject_teacher, name="reject-teacher"),
    path("<int:pk>/", delete_teacher, name="delete-teacher"),
]
