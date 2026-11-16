
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

    # JWT
    path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # Admin dashboard
    path("admin/overview/", AdminOverviewView.as_view(), name="admin-overview"),
    path("admin/users/", AdminUserListView.as_view(), name="admin-users"),
    path(
        "admin/users/<int:pk>/status/",
        AdminUserStatusView.as_view(),
        name="admin-user-status",
    ),
    path(
        "admin/enrollments/",
        AdminEnrollmentListView.as_view(),
        name="admin-enrollments",
    ),
    path(
        "admin/enrollments/<int:pk>/",
        AdminEnrollmentDeleteView.as_view(),
        name="admin-enrollment-delete",
    ),
]
