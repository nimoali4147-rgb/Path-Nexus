from django.db import models
from django.conf import settings

# Create your models here.

class TeacherProfile(models.Model):
    user = models.OneToOneField(
       settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='teacher_profile'
    )
    bio = models.TextField(blank=True)
    qualifications = models.TextField(blank=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username}"
