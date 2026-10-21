from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class UserProfile(models.Model):
    Role_Choices = [
        ('student', 'Student'),
        ('teacher', 'Teacher'),
        ('admin', 'Super Admin')
    ]

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile'
    )

    role = models.CharField(
        max_length=20,
        choices=Role_Choices,
        default='student'
    )

    def __str__(self):
        return f"{self.user.username} - {self.role}"
