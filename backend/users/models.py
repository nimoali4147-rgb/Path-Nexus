
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):

    class Role(models.TextChoices):
        ADMIN = "admin", "Admin"
        TEACHER = "teacher", "Teacher"
        STUDENT = "student", "Student"

    role = models.CharField(
        max_length=10,
        choices=Role.choices,
        default=Role.STUDENT
    )

    account_status = models.CharField(
        max_length=20,
        default="ACTIVE"
    )

    is_email_verified = models.BooleanField(
        default=False
    )

    def __str__(self):
        return f"{self.username} - {self.role}"
