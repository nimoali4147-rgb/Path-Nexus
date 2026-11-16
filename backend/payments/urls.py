from django.urls import path
from .views import (
    PaymentCreateView,
    MpesaCallbackView,
    MyPaymentsView,
    AdminPaymentListView,
    PaymentStatusView,
)


urlpatterns = [
    path("create/", PaymentCreateView.as_view(), name="payment-create"),
    path("callback/", MpesaCallbackView.as_view(), name="mpesa-callback"),
    path("my-payments/", MyPaymentsView.as_view(), name="my-payments"),
    path(
        "<int:payment_id>/status/",
        PaymentStatusView.as_view(),
        name="payment-status"),
    path("admin/", AdminPaymentListView.as_view(), name="admin-payments"),
]
