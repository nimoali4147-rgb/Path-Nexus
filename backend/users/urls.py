
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import RegisterView, EmailLoginView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", EmailLoginView.as_view(), name="email_login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]
