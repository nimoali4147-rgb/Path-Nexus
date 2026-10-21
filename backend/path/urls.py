from django.urls import path
from .views import home_api

urlpatterns = [
    path('', home_api, name='home-api'),
]