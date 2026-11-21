from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.reverse import reverse
from rest_framework.test import APIClient

from courses.models import Course, Enrollment, Lesson
from students.models import StudentProfile
from teachers.models import TeacherProfile

User = get_user_model()


class CourseWorkflowTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.teacher = User.objects.create_user(
            username="omar", email="omar@example.com",
            password="SafePass123!", role="teacher",
        )
        TeacherProfile.objects.create(user=self.teacher, is_verified=True)

        self.unverified_teacher = User.objects.create_user(
            username="newteacher", email="newteacher@example.com",
            password="SafePass123!", role="teacher",
        )
        TeacherProfile.objects.create(user=self.unverified_teacher)

        self.student = User.objects.create_user(
            username="student", email="student@example.com",
            password="SafePass123!", role="student",
        )
        StudentProfile.objects.create(user=self.student)

        self.admin = User.objects.create_superuser(
            username="admin", email="admin@example.com",
            password="SafePass123!",
        )

    def course_data(self, **overrides):
        data = {
            "title": "Python for Beginners",
            "description": "Learn Python basics.",
            "category": "Programming",
            "price": "0.00",
            "is_free": True,
        }
        data.update(overrides)
        return data

    def test_verified_teacher_can_create_course(self):
        self.client.force_authenticate(self.teacher)
        response = self.client.post(
            reverse("course-list"), self.course_data(), format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["teacher"], self.teacher.id)
        self.assertEqual(response.data["status"], Course.Status.DRAFT)

    def test_unverified_teacher_cannot_create_course(self):
        self.client.force_authenticate(self.unverified_teacher)
        response = self.client.post(
            reverse("course-list"), self.course_data(), format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_student_cannot_create_course(self):
        self.client.force_authenticate(self.student)
        response = self.client.post(
            reverse("course-list"), self.course_data(), format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_teacher_can_edit_own_draft_course(self):
        course = Course.objects.create(
            title="Old title", description="Description",
            category="Programming", teacher=self.teacher,
        )
        self.client.force_authenticate(self.teacher)
        response = self.client.patch(
            reverse("course-detail", args=[course.id]),
            {"title": "Updated title"}, format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        course.refresh_from_db()
        self.assertEqual(course.title, "Updated title")

    def test_teacher_can_submit_own_course(self):
        course = Course.objects.create(
            title="Draft", description="Description",
            category="Programming", teacher=self.teacher,
        )
        self.client.force_authenticate(self.teacher)
        response = self.client.post(
            reverse("course-submit", args=[course.id]), {}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        course.refresh_from_db()
        self.assertEqual(course.status, Course.Status.PENDING)

    def test_admin_can_approve_pending_course(self):
        course = Course.objects.create(
            title="Pending", description="Description",
            category="Programming", teacher=self.teacher,
            status=Course.Status.PENDING,
        )
        self.client.force_authenticate(self.admin)
        response = self.client.patch(
            reverse("course-approve", args=[course.id]), {}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        course.refresh_from_db()
        self.assertEqual(course.status, Course.Status.PUBLISHED)

    def test_student_can_enroll_in_published_free_course_once(self):
        course = Course.objects.create(
            title="Free", description="Description",
            category="Programming", teacher=self.teacher,
            status=Course.Status.PUBLISHED, price=0, is_free=True,
        )
        self.client.force_authenticate(self.student)
        url = reverse("enrollment-list-create")
        response = self.client.post(url, {"course": course.id}, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        duplicate = self.client.post(
            url, {"course": course.id}, format="json"
        )
        self.assertEqual(duplicate.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            Enrollment.objects.filter(student=self.student, course=course).count(),
            1,
        )

    def test_student_cannot_enroll_in_paid_course_without_payment(self):
        course = Course.objects.create(
            title="Paid", description="Description",
            category="Programming", teacher=self.teacher,
            status=Course.Status.PUBLISHED, price="1500.00", is_free=False,
        )
        self.client.force_authenticate(self.student)
        response = self.client.post(
            reverse("enrollment-list-create"),
            {"course": course.id}, format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(
            Enrollment.objects.filter(student=self.student, course=course).exists()
        )

    def test_verified_teacher_can_create_update_and_delete_own_lesson(self):
        course = Course.objects.create(
            title="Lesson Course",
            description="Course description",
            category="Programming",
            teacher=self.teacher,
        )
        self.client.force_authenticate(self.teacher)

        create_response = self.client.post(
            reverse("lesson-list"),
            {
                "course": course.id,
                "title": "Introduction",
                "description": "First lesson",
                "youtube_url": "https://www.youtube.com/watch?v=abc123xyz",
                "order": 1,
            },
            format="multipart",
        )
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        lesson_id = create_response.data["id"]

        update_response = self.client.patch(
            reverse("lesson-detail", args=[lesson_id]),
            {"title": "Updated introduction"},
            format="multipart",
        )
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        self.assertEqual(update_response.data["title"], "Updated introduction")

        delete_response = self.client.delete(
            reverse("lesson-detail", args=[lesson_id])
        )
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Lesson.objects.filter(pk=lesson_id).exists())

    def test_unverified_teacher_cannot_manage_lessons(self):
        course = Course.objects.create(
            title="Protected Course",
            description="Course description",
            category="Programming",
            teacher=self.unverified_teacher,
        )
        lesson = Lesson.objects.create(
            course=course,
            title="Existing lesson",
            youtube_url="https://www.youtube.com/watch?v=abc123xyz",
        )
        self.client.force_authenticate(self.unverified_teacher)

        response = self.client.patch(
            reverse("lesson-detail", args=[lesson.id]),
            {"title": "Attempted update"},
            format="multipart",
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_teacher_cannot_delete_course_with_enrollments(self):
        course = Course.objects.create(
            title="Enrolled Course",
            description="Course description",
            category="Programming",
            teacher=self.teacher,
        )
        Enrollment.objects.create(student=self.student, course=course)
        self.client.force_authenticate(self.teacher)

        response = self.client.delete(
            reverse("course-detail", args=[course.id])
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertTrue(Course.objects.filter(pk=course.id).exists())

    def test_paid_course_lessons_are_hidden_until_student_enrolls(self):
        course = Course.objects.create(
            title="Paid Lesson Course",
            description="Course description",
            category="Programming",
            teacher=self.teacher,
            status=Course.Status.PUBLISHED,
            price="1200.00",
            is_free=False,
        )
        lesson = Lesson.objects.create(
            course=course,
            title="Paid lesson",
            youtube_url="https://www.youtube.com/watch?v=abc123xyz",
        )

        anonymous_response = self.client.get(reverse("lesson-list"))
        self.assertNotIn(lesson.id, [item["id"] for item in anonymous_response.data])

        self.client.force_authenticate(self.student)
        student_response = self.client.get(reverse("lesson-list"))
        self.assertNotIn(lesson.id, [item["id"] for item in student_response.data])

        Enrollment.objects.create(student=self.student, course=course)
        enrolled_response = self.client.get(reverse("lesson-list"))
        self.assertIn(lesson.id, [item["id"] for item in enrolled_response.data])
