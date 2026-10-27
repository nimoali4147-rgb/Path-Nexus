from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework.reverse import reverse

from users.models import UserProfile
from students.models import StudentProfile


class StudentPermissionTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.student = User.objects.create_user(
            username="student", password="SafePass123!"
        )
        UserProfile.objects.create(user=self.student, role="student")
        StudentProfile.objects.create(user=self.student)

    # student cannot list students
    def test_student_list(self):
        self.client.force_authenticate(user=self.student)
        res = self.client.get(reverse("student-list"))

        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    # admin can list students
    def test_admin_list(self):
        admin = User.objects.create_superuser(
            username="admin",
            email="admin@example.com",
            password="SafePass123!",
        )

        self.client.force_authenticate(user=admin)
        res = self.client.get(reverse("student-list"))

        self.assertEqual(res.status_code, status.HTTP_200_OK)

    # student can update own bio
    def test_update_bio(self):
        self.client.force_authenticate(user=self.student)
        res = self.client.patch(
            reverse("student-profile-me"),
            {"bio": "I am learning Python."},
            format="json",
        )

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["bio"], "I am learning Python.")

    # student cannot change user id
    def test_change_user(self):
        other = User.objects.create_user(
            username="another_student", password="SafePass123!"
        )

        self.client.force_authenticate(user=self.student)
        res = self.client.patch(
            reverse("student-profile-me"),
            {"user": other.id, "bio": "Updated"},
            format="json",
        )

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["user"], self.student.id)