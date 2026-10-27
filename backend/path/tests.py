from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework.reverse import reverse

from .models import UserProfile
from students.models import StudentProfile
from teachers.models import TeacherProfile


class RegistrationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse("register")

    def test_student_registration_creates_profiles(self):
        response = self.client.post(self.url, {
            "username": "student_one",
            "email": "student@example.com",
            "password": "SafePass123!",
            "role": "student",
        }, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(username="student_one")
        self.assertEqual(user.profile.role, "student")
        self.assertTrue(StudentProfile.objects.filter(user=user).exists())
        self.assertFalse(TeacherProfile.objects.filter(user=user).exists())

    def test_teacher_registration_creates_unverified_teacher_profile(self):
        response = self.client.post(self.url, {
            "username": "teacher_one",
            "email": "teacher@example.com",
            "password": "SafePass123!",
            "role": "teacher",
        }, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(username="teacher_one")
        self.assertEqual(user.profile.role, "teacher")
        self.assertFalse(user.teacher_profile.is_verified)

    def test_public_registration_cannot_create_admin(self):
        response = self.client.post(self.url, {
            "username": "bad_admin",
            "email": "admin@example.com",
            "password": "SafePass123!",
            "role": "admin",
        }, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(User.objects.filter(username="bad_admin").exists())
