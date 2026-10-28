
from decimal import Decimal

from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from courses.models import Course
from .models import Payment
from .serializers import PaymentSerializer
from .utils import send_stk_push

import logging

logger = logging.getLogger(__name__)


class PaymentCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != "student":
            return Response(
                {"detail": "Only students can make payments."},
                status=status.HTTP_403_FORBIDDEN,
            )

        course = get_object_or_404(
            Course,
            id=request.data.get("course"),
            status="PUBLISHED",
            is_free=False,
        )

        phone_number = request.data.get("phone_number", "").strip()

        if not phone_number:
            return Response(
                {"phone_number": "This field is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        payment = Payment.objects.create(
            student=request.user,
            course=course,
            amount=course.price,
            phone_number=phone_number,
        )

        try:
            result = send_stk_push(
                phone_number=phone_number,
                amount=payment.amount,
                account_reference=f"COURSE-{course.id}",
                transaction_desc=f"Payment for {course.title}",
            )
        except Exception as e:
            print("MPESA ERROR:", repr(e))

            payment.status = Payment.Status.FAILED
            payment.save(update_fields=["status"])

            return Response(
                {"detail": "Could not start M-Pesa payment."},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        if str(result.get("ResponseCode", "")) != "0":
            payment.status = Payment.Status.FAILED
            payment.save(update_fields=["status"])
            return Response(
                {
                    "detail": "Safaricom did not accept the payment request.",
                    "daraja_response": result,
                },
                status=status.HTTP_502_BAD_GATEWAY,
            )

        payment.checkout_request_id = result.get("CheckoutRequestID")
        payment.merchant_request_id = result.get("MerchantRequestID")
        payment.save(
            update_fields=[
                "checkout_request_id",
                "merchant_request_id",
            ]
        )

        return Response(
            {
                "message": "M-Pesa payment request sent.",
                "payment": PaymentSerializer(payment).data,
                "daraja_response": result,
            },
            status=status.HTTP_201_CREATED,
        )


class MpesaCallbackView(APIView):
    # Safaricom sends this callback without a user JWT.
    permission_classes = []

    def post(self, request):
        callback = request.data.get("Body", {}).get("stkCallback", {})
        checkout_id = callback.get("CheckoutRequestID")
        result_code = callback.get("ResultCode")

        if not checkout_id:
            return Response(
                {"ResultCode": 0, "ResultDesc": "Callback received."},
                status=status.HTTP_200_OK,
            )

        payment = Payment.objects.filter(
            checkout_request_id=checkout_id
        ).first()

        # Acknowledge unknown callbacks; never grant access without a matching payment.
        if payment is None:
            return Response(
                {"ResultCode": 0, "ResultDesc": "Callback received."},
                status=status.HTTP_200_OK,
            )

        if result_code == 0:
            metadata = callback.get("CallbackMetadata", {}).get("Item", [])
            receipt = next(
                (
                    item.get("Value")
                    for item in metadata
                    if item.get("Name") == "MpesaReceiptNumber"
                ),
                None,
            )
            payment.status = Payment.Status.SUCCESS
            payment.mpesa_receipt_number = receipt
            payment.save(update_fields=["status", "mpesa_receipt_number"])

            # Enroll the student only after Safaricom reports success.
            from courses.models import Enrollment
            Enrollment.objects.get_or_create(
                student=payment.student,
                course=payment.course,
            )
        else:
            payment.status = Payment.Status.FAILED
            payment.save(update_fields=["status"])

        return Response(
            {"ResultCode": 0, "ResultDesc": "Callback processed."},
            status=status.HTTP_200_OK,
        )
