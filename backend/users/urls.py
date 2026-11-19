
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
    PasswordResetRequestView,
    PasswordResetConfirmView,
    GoogleLoginView,
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", EmailLoginView.as_view(), name="email_login"),
    path("password-reset/request/", PasswordResetRequestView.as_view(),
         name="password-reset-request"),
    path("password-reset/confirm/", PasswordResetConfirmView.as_view(),
         name="password-reset-confirm"),
    path("google/", GoogleLoginView.as_view(), name="google-login"),

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
