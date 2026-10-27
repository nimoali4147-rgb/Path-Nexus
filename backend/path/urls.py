from django.urls import path
from .views import home_api
from .views import RegisterView

urlpatterns = [
    path('', home_api, name='home-api'),
        path("auth/register/", RegisterView.as_view(), name="register"),

]