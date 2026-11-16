
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0006_enrollment_completed_at_enrollment_completed_lessons_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='course',
            name='status',
            field=models.CharField(
                choices=[
                    ('DRAFT', 'Draft'),
                    ('PENDING', 'Pending'),
                    ('PUBLISHED', 'Published'),
                    ('UNPUBLISHED', 'Unpublished'),
                    ('REJECTED', 'Rejected'),
                ],
                default='DRAFT',
                max_length=20,
            ),
        ),
    ]
