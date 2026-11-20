
import logging
from decimal import Decimal, InvalidOperation
from rest_framework.generics import DestroyAPIView
from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from courses.models import Course, Enrollment
from users.permissions import IsPlatformAdmin
from datetime import timedelta
from django.utils import timezone
from .models import Payment
from .serializers import PaymentSerializer
from .utils import send_stk_push


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
            status=Course.Status.PUBLISHED,
            is_free=False,
        )

        phone_number = request.data.get("phone_number")

        if not isinstance(phone_number, str):
            return Response(
                {"phone_number": "A valid phone number is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        phone_number = phone_number.strip()

        if not phone_number:
            return Response(
                {"phone_number": "This field is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        existing_enrollment = Enrollment.objects.filter(
            student=request.user,
            course=course,
        ).exists()

        if existing_enrollment:
            return Response(
                {"detail": "You are already enrolled in this course."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Prevent duplicate pending STK requests.
        recent_pending = Payment.objects.filter(
            student=request.user,
            course=course,
            status=Payment.Status.PENDING,
            created_at__gte=timezone.now() - timedelta(minutes=2),
        ).exists()

        if recent_pending:
            return Response(
                {
                    "detail": (
                        "A payment request is already pending. "
                        "Please wait before trying again."
                    )
                },
                status=status.HTTP_409_CONFLICT,
            )

        # Create payment record before sending STK Push.
        payment = Payment.objects.create(
            student=request.user,
            course=course,
            amount=course.price,
            phone_number=phone_number,
            status=Payment.Status.PENDING,
        )

        try:
            result = send_stk_push(
                phone_number=phone_number,
                amount=payment.amount,
                account_reference=f"COURSE-{course.id}",
                transaction_desc="Course payment",
            )

        except Exception:
            logger.exception(
                "Failed to initiate M-Pesa payment for payment %s",
                payment.id,
            )

            payment.status = Payment.Status.FAILED
            payment.save(update_fields=["status"])

            return Response(
                {"detail": "Could not start M-Pesa payment."},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        if not isinstance(result, dict):
            payment.status = Payment.Status.FAILED
            payment.save(update_fields=["status"])

            return Response(
                {"detail": "Invalid response from Safaricom."},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        if str(result.get("ResponseCode", "")) != "0":
            payment.status = Payment.Status.FAILED
            payment.save(update_fields=["status"])

            logger.error(
                "M-Pesa rejected payment %s: %s",
                payment.id,
                result,
            )

            return Response(
                {
                    "detail": "Safaricom did not accept the payment request.",
                },
                status=status.HTTP_502_BAD_GATEWAY,
            )

        checkout_id = result.get("CheckoutRequestID")
        merchant_id = result.get("MerchantRequestID")

        if not checkout_id:
            payment.status = Payment.Status.FAILED
            payment.save(update_fields=["status"])

            return Response(
                {"detail": "Safaricom did not return a checkout ID."},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        payment.checkout_request_id = checkout_id
        payment.merchant_request_id = merchant_id

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
            },
            status=status.HTTP_201_CREATED,
        )


class MpesaCallbackView(APIView):
    # Safaricom callbacks do not use the user's JWT.
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        callback = (
            request.data
            .get("Body", {})
            .get("stkCallback", {})
        )

        checkout_id = callback.get("CheckoutRequestID")
        result_code = callback.get("ResultCode")

        if not checkout_id:
            logger.warning(
                "M-Pesa callback received without CheckoutRequestID.")

            return Response(
                {
                    "ResultCode": 0,
                    "ResultDesc": "Callback received.",
                },
                status=status.HTTP_200_OK,
            )

        try:
            result_code = int(result_code)
        except (TypeError, ValueError):
            logger.warning(
                "Invalid M-Pesa ResultCode for checkout %s",
                checkout_id,
            )

            return Response(
                {
                    "ResultCode": 0,
                    "ResultDesc": "Callback received.",
                },
                status=status.HTTP_200_OK,
            )

        with transaction.atomic():
            payment = (
                Payment.objects.select_for_update()
                .filter(checkout_request_id=checkout_id)
                .first()
            )

            if payment is None:
                logger.warning(
                    "Unknown M-Pesa checkout ID: %s",
                    checkout_id,
                )

                return Response(
                    {
                        "ResultCode": 0,
                        "ResultDesc": "Callback received.",
                    },
                    status=status.HTTP_200_OK,
                )

            # Do not allow a repeated callback to overwrite a successful payment.
            if payment.status == Payment.Status.SUCCESS:
                return Response(
                    {
                        "ResultCode": 0,
                        "ResultDesc": "Payment already processed.",
                    },
                    status=status.HTTP_200_OK,
                )

            if result_code != 0:
                payment.status = Payment.Status.FAILED
                payment.save(update_fields=["status"])

                return Response(
                    {
                        "ResultCode": 0,
                        "ResultDesc": "Payment failure recorded.",
                    },
                    status=status.HTTP_200_OK,
                )

            metadata = (
                callback
                .get("CallbackMetadata", {})
                .get("Item", [])
            )

            metadata_values = {
                item.get("Name"): item.get("Value")
                for item in metadata
                if isinstance(item, dict)
            }

            receipt = metadata_values.get("MpesaReceiptNumber")
            received_amount = metadata_values.get("Amount")

            if not receipt or received_amount is None:
                logger.error(
                    "Successful callback is missing amount or receipt. "
                    "Payment ID: %s",
                    payment.id,
                )

                # Keep pending until the transaction can be verified.
                return Response(
                    {
                        "ResultCode": 0,
                        "ResultDesc": "Callback received for verification.",
                    },
                    status=status.HTTP_200_OK,
                )

            try:
                received_amount = Decimal(str(received_amount))
            except (InvalidOperation, TypeError, ValueError):
                logger.error(
                    "Invalid callback amount for payment %s",
                    payment.id,
                )

                return Response(
                    {
                        "ResultCode": 0,
                        "ResultDesc": "Callback received for verification.",
                    },
                    status=status.HTTP_200_OK,
                )

            if received_amount != payment.amount:
                logger.error(
                    "Payment amount mismatch. Payment ID: %s",
                    payment.id,
                )

                return Response(
                    {
                        "ResultCode": 0,
                        "ResultDesc": "Callback received for verification.",
                    },
                    status=status.HTTP_200_OK,
                )

            duplicate_receipt = Payment.objects.filter(
                mpesa_receipt_number=receipt
            ).exclude(id=payment.id).exists()

            if duplicate_receipt:
                logger.error(
                    "Duplicate M-Pesa receipt detected: %s",
                    receipt,
                )

                return Response(
                    {
                        "ResultCode": 0,
                        "ResultDesc": "Callback received for verification.",
                    },
                    status=status.HTTP_200_OK,
                )

            payment.status = Payment.Status.SUCCESS
            payment.mpesa_receipt_number = receipt

            payment.save(
                update_fields=[
                    "status",
                    "mpesa_receipt_number",
                ]
            )

            # Enroll only after the payment amount and receipt are validated.
            Enrollment.objects.get_or_create(
                student=payment.student,
                course=payment.course,
            )

        return Response(
            {
                "ResultCode": 0,
                "ResultDesc": "Callback processed successfully.",
            },
            status=status.HTTP_200_OK,
        )


class MyPaymentsView(ListAPIView):
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Payment.objects.filter(
            student=self.request.user
        ).select_related(
            "student",
            "course",
        ).order_by("-created_at")


class PaymentStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, payment_id):
        payment = get_object_or_404(
            Payment,
            id=payment_id,
            student=request.user,
        )

        return Response({
            "payment_id": payment.id,
            "status": payment.status,
            "receipt_number": payment.mpesa_receipt_number,
        })


class AdminPaymentListView(ListAPIView):
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated, IsPlatformAdmin]

    def get_queryset(self):
        return Payment.objects.select_related(
            "student",
            "course",
        ).order_by("-created_at")


class AdminPaymentDeleteView(DestroyAPIView):
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated, IsPlatformAdmin]

    queryset = Payment.objects.all()
