from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.reverse import reverse
from rest_framework.test import APIClient

from teachers.models import TeacherProfile

User = get_user_model()


class TeacherEndpointTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.teacher_user = User.objects.create_user(
            username="omar", email="omar@example.com",
            password="SafePass123!", role="teacher",
        )
        self.teacher = TeacherProfile.objects.create(user=self.teacher_user)
        self.admin = User.objects.create_superuser(
            username="admin", email="admin@example.com",
            password="SafePass123!",
        )

    def test_admin_can_verify_teacher(self):
        self.client.force_authenticate(self.admin)
        response = self.client.patch(
            reverse("verify-teacher", args=[self.teacher.id]), {}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.teacher.refresh_from_db()
        self.assertTrue(self.teacher.is_verified)

    def test_teacher_cannot_verify_teacher(self):
        self.client.force_authenticate(self.teacher_user)
        response = self.client.patch(
            reverse("verify-teacher", args=[self.teacher.id]), {}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_teacher_can_update_own_bio_but_not_verification(self):
        self.client.force_authenticate(self.teacher_user)
        response = self.client.patch(
            reverse("teacher-profile-me"),
            {"bio": "Experienced teacher", "is_verified": True},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["bio"], "Experienced teacher")
        self.assertFalse(response.data["is_verified"])
