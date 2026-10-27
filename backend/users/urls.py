
from django.urls import path
from .views import RegisterView, EmailLoginView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
      path("login/", EmailLoginView.as_view(), name="email_login"),
]
