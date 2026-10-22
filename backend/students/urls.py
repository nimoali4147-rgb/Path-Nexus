from django.urls import path
from .views import student_list, delete_student

urlpatterns = [
    path('', student_list, name='student-list'),
      path("<int:pk>/", delete_student, name="delete-student"),
]
