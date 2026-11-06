
from django.urls import path
from .views import PaymentCreateView, MpesaCallbackView, MyPaymentsView

urlpatterns = [
    path("create/", PaymentCreateView.as_view(), name="payment-create"),
    path("callback/", MpesaCallbackView.as_view(), name="mpesa-callback"),
    path("my-payments/", MyPaymentsView.as_view(), name="my-payments"),
]
