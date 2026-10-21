from rest_framework import serializers
from .models import StudentProfile

class StudentProfileSerializers(serializers.ModelSerializer):
    class Meta:
        model = StudentProfile
        fields = ['id', 'user', 'bio', 'created_at']
        read_only_fields = ['id', 'created_at']