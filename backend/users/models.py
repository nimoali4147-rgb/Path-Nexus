
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


class PasswordResetCode(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="password_reset_codes")
    code_hash = models.CharField(max_length=256)
    expires_at = models.DateTimeField()
    attempts = models.PositiveSmallIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Password reset for user {self.user_id}"
