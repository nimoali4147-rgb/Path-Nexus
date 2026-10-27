from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework import status
from rest_framework.reverse import reverse
from rest_framework.test import APIClient

from users.models import UserProfile
from teachers.models import TeacherProfile
from students.models import StudentProfile
from .models import Course, Enrollment


class CourseWorkflow(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.teacher = User.objects.create_user(
            username="teacher", password="SafePass123!"
        )
        UserProfile.objects.create(user=self.teacher, role="teacher")
        TeacherProfile.objects.create(user=self.teacher, is_verified=True)

        self.new_teacher = User.objects.create_user(
            username="new_teacher", password="SafePass123!"
        )
        UserProfile.objects.create(user=self.new_teacher, role="teacher")
        TeacherProfile.objects.create(
            user=self.new_teacher, is_verified=False
        )

        self.student = User.objects.create_user(
            username="student", password="SafePass123!"
        )
        UserProfile.objects.create(user=self.student, role="student")
        StudentProfile.objects.create(user=self.student)

        self.url = reverse("course-list")

    def course_data(self):
        return {
            "title": "Django Basics",
            "description": "Learn Django fundamentals.",
            "category": "Programming",
            "price": "0.00",
            "is_free": True,
        }
    # teachers can create course
    def create_course(self):
        self.client.force_authenticate(user=self.teacher)
        response = self.client.post(
            self.url, self.course_data(), format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["status"], Course.Status.DRAFT)
        self.assertEqual(response.data["teacher"], self.teacher.id)

    # unverified teacher can not create course
    def unverified_teacher(self):
        self.client.force_authenticate(user=self.new_teacher)
        response = self.client.post(
            self.url, self.course_data(), format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    # students canot create course 
    def student_course(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.post(
            self.url, self.course_data(), format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    # teacher cannot approve course
    def teacher_approve(self):
        course = Course.objects.create(
            title="Pending course",
            description="Description",
            category="Programming",
            teacher=self.teacher,
            status=Course.Status.PENDING,
        )

        self.client.force_authenticate(user=self.teacher)
        response = self.client.patch(
            reverse("course-approve", args=[course.id]), {}, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    # student can enroll a course
    def test_student_can_enroll_once(self):
        course = Course.objects.create(
            title="Published course",
            description="Description",
            category="Programming",
            teacher=self.teacher,
            status=Course.Status.PUBLISHED,
            is_free=True,
            price=0,
        )

        self.client.force_authenticate(user=self.student)
        url = reverse("enrollment-list-create")

        response = self.client.post(
            url, {"course": course.id}, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(
            Enrollment.objects.filter(
                student=self.student, course=course
            ).count(),
            1,
        )

        response = self.client.post(
            url, {"course": course.id}, format="json"
        )

        self.assertEqual(
            response.status_code, status.HTTP_400_BAD_REQUEST
        )
        self.assertEqual(
            Enrollment.objects.filter(
                student=self.student, course=course
            ).count(),
            1,
        )

    # students cannot enroll unpublished course
    def unpublished_course(self):
        course = Course.objects.create(
            title="Draft course",
            description="Description",
            category="Programming",
            teacher=self.teacher,
            status=Course.Status.DRAFT,
        )

        self.client.force_authenticate(user=self.student)
        response = self.client.post(
            reverse("enrollment-list-create"),
            {"course": course.id},
            format="json",
        )

        self.assertEqual(
            response.status_code, status.HTTP_404_NOT_FOUND
        )

    # teacher can submit
    def submit_course(self):
        course = Course.objects.create(
            title="Draft to submit",
            description="Description",
            category="Programming",
            teacher=self.teacher,
            status=Course.Status.DRAFT,
        )

        self.client.force_authenticate(user=self.teacher)
        response = self.client.post(
            reverse("course-submit", args=[course.id]), {}, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        course.refresh_from_db()
        self.assertEqual(course.status, Course.Status.PENDING)

    # admin can approve  course
    def admin_approve(self):
        admin = User.objects.create_superuser(
            username="admin",
            email="admin@example.com",
            password="SafePass123!",
        )

        course = Course.objects.create(
            title="Pending course",
            description="Description",
            category="Programming",
            teacher=self.teacher,
            status=Course.Status.PENDING,
        )

        self.client.force_authenticate(user=admin)
        response = self.client.patch(
            reverse("course-approve", args=[course.id]), {}, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        course.refresh_from_db()
        self.assertEqual(course.status, Course.Status.PUBLISHED)

    # student cannot enroll in paid course
    def paid_course(self):
        course = Course.objects.create(
            title="Paid course",
            description="Description",
            category="Programming",
            teacher=self.teacher,
            status=Course.Status.PUBLISHED,
            is_free=False,
            price="100.00",
        )

        self.client.force_authenticate(user=self.student)
        response = self.client.post(
            reverse("enrollment-list-create"),
            {"course": course.id},
            format="json",
        )

        self.assertEqual(
            response.status_code, status.HTTP_400_BAD_REQUEST
        )
        self.assertEqual(
            Enrollment.objects.filter(
                student=self.student, course=course
            ).count(),
            0,
        )
