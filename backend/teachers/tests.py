from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework.reverse import reverse

from users.models import UserProfile
from teachers.models import TeacherProfile


class TeacherPermissionTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.t = User.objects.create_user(
            username="teacher", password="SafePass123!"
        )
        UserProfile.objects.create(user=self.t, role="teacher")
        self.teacher = TeacherProfile.objects.create(user=self.t)

        self.url = reverse("verify-teacher", args=[self.teacher.id])

    # teacher cannot verify teacher
    def test_teacher_verify(self):
        self.client.force_authenticate(user=self.t)
        res = self.client.patch(self.url, {}, format="json")

        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    # admin can verify teacher
    def test_admin_verify(self):
        admin = User.objects.create_superuser(
            username="admin",
            email="admin@example.com",
            password="SafePass123!",
        )

        self.client.force_authenticate(user=admin)
        res = self.client.patch(self.url, {}, format="json")

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.teacher.refresh_from_db()
        self.assertTrue(self.teacher.is_verified)

    # teacher cannot list teachers
    def test_teacher_list(self):
        self.client.force_authenticate(user=self.t)
        res = self.client.get(reverse("teacher-list"))

        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    # teacher can update bio but cannot verify self
    def test_update_bio(self):
        self.client.force_authenticate(user=self.t)
        res = self.client.patch(
            reverse("teacher-profile-me"),
            {"bio": "Experienced teacher", "is_verified": True},
            format="json",
        )

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["bio"], "Experienced teacher")
        self.assertFalse(res.data["is_verified"])
