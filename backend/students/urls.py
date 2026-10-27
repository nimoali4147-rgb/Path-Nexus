from django.urls import path
from .views import student_list, delete_student, StudentOwnProfileView

urlpatterns = [
    path("", student_list, name="student-list"),
    path("me/", StudentOwnProfileView.as_view(), name="student-profile-me"),
    path("<int:pk>/", delete_student, name="delete-student"),
]
