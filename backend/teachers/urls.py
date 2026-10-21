from django.urls import path
from .views import teacher_list

urlpatterns = [
    path('', teacher_list, name='teacher-list'),
]