
from django.urls import path

from .views import (
    PaymentCreateView,
    MpesaCallbackView,
    MyPaymentsView,
    PaymentStatusView,
    AdminPaymentListView,
    AdminPaymentDeleteView,
)

urlpatterns = [
    path("create/", PaymentCreateView.as_view(), name="payment-create"),
    path("callback/", MpesaCallbackView.as_view(), name="mpesa-callback"),
    path("my-payments/", MyPaymentsView.as_view(), name="my-payments"),

    # Student payment status
    path(
        "<int:payment_id>/status/",
        PaymentStatusView.as_view(),
        name="payment-status",
    ),

    # Admin payments
    path("admin/", AdminPaymentListView.as_view(), name="admin-payment-list"),
    path(
        "admin/<int:pk>/",
        AdminPaymentDeleteView.as_view(),
        name="admin-payment-delete",
    ),
]
