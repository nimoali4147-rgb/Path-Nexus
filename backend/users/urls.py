
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    RegisterView,
    EmailLoginView,
    AdminOverviewView,
    AdminUserListView,
    AdminUserStatusView,
    AdminEnrollmentListView,
    AdminEnrollmentDeleteView,
)


urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", EmailLoginView.as_view(), name="email_login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # ADMIN
    path("admin/overview/", AdminOverviewView.as_view()),
    path("admin/users/", AdminUserListView.as_view()),
    path("admin/users/<int:pk>/status/", AdminUserStatusView.as_view()),

    path("admin/enrollments/", AdminEnrollmentListView.as_view()),
    path(
        "admin/enrollments/<int:pk>/",
        AdminEnrollmentDeleteView.as_view(),
    ),
]
