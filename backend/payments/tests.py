from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework.reverse import reverse

from courses.models import Course, Enrollment
from payments.models import Payment
from students.models import StudentProfile
from teachers.models import TeacherProfile

User = get_user_model()


class PaymentCallbackTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.teacher = User.objects.create_user(
            username="teacher", email="teacher@example.com",
            password="SafePass123!", role="teacher",
        )
        TeacherProfile.objects.create(user=self.teacher, is_verified=True)
        self.student = User.objects.create_user(
            username="student", email="student@example.com",
            password="SafePass123!", role="student",
        )
        StudentProfile.objects.create(user=self.student)
        self.course = Course.objects.create(
            title="Paid Python", description="Description",
            category="Programming", teacher=self.teacher,
            price="1500.00", is_free=False, status=Course.Status.PUBLISHED,
        )
        self.payment = Payment.objects.create(
            student=self.student, course=self.course, amount="1500.00",
            phone_number="254712345678",
            checkout_request_id="ws_CO_test_123",
        )

    def test_successful_callback_marks_payment_and_enrolls_student(self):
        response = self.client.post(
            reverse("mpesa-callback"),
            {"Body": {"stkCallback": {
                "CheckoutRequestID": "ws_CO_test_123",
                "ResultCode": 0,
                "CallbackMetadata": {"Item": [
                    {"Name": "MpesaReceiptNumber", "Value": "TEST123"},
                    {"Name": "Amount", "Value": 1500},
                ]},
            }}},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.payment.refresh_from_db()
        self.assertEqual(self.payment.status, Payment.Status.SUCCESS)
        self.assertEqual(self.payment.mpesa_receipt_number, "TEST123")
        self.assertTrue(
            Enrollment.objects.filter(
                student=self.student, course=self.course
            ).exists()
        )

    def test_failed_callback_does_not_enroll_student(self):
        response = self.client.post(
            reverse("mpesa-callback"),
            {"Body": {"stkCallback": {
                "CheckoutRequestID": "ws_CO_test_123",
                "ResultCode": 1032,
                "ResultDesc": "Cancelled by user",
            }}},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.payment.refresh_from_db()
        self.assertEqual(self.payment.status, Payment.Status.FAILED)
        self.assertFalse(
            Enrollment.objects.filter(
                student=self.student, course=self.course
            ).exists()
        )
