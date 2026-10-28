from django.urls import path
from .views import PaymentCreateView, MpesaCallbackView

urlpatterns = [
    path("create/", PaymentCreateView.as_view(), name="payment-create"),
    path("callback/", MpesaCallbackView.as_view(), name="mpesa-callback"),
]
