from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.reverse import reverse
from rest_framework.test import APIClient

from students.models import StudentProfile

User = get_user_model()


class StudentEndpointTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.student_user = User.objects.create_user(
            username="student", email="student@example.com",
            password="SafePass123!", role="student",
        )
        self.student = StudentProfile.objects.create(user=self.student_user)
        self.admin = User.objects.create_superuser(
            username="admin", email="admin@example.com",
            password="SafePass123!",
        )

    def test_admin_can_list_students(self):
        self.client.force_authenticate(self.admin)
        response = self.client.get(reverse("student-list"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_student_cannot_list_students(self):
        self.client.force_authenticate(self.student_user)
        response = self.client.get(reverse("student-list"))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_student_can_update_own_bio(self):
        self.client.force_authenticate(self.student_user)
        response = self.client.patch(
            reverse("student-profile-me"),
            {"bio": "Learning Python"}, format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["bio"], "Learning Python")
