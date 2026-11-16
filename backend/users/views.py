
from django.contrib.auth import get_user_model
from django.db.models import Sum, Count, Q

from rest_framework import generics, status, serializers
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.generics import DestroyAPIView
from courses.models import Course, Enrollment
from teachers.models import TeacherProfile
from students.models import StudentProfile
from payments.models import Payment

from .serializers import RegisterSerializer, EmailLoginSerializer
from .permissions import IsPlatformAdmin


User = get_user_model()


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


class EmailLoginView(TokenObtainPairView):
    serializer_class = EmailLoginSerializer


# ADMIN DASHBOARD OVERVIEW
class AdminOverviewView(APIView):
    permission_classes = [IsPlatformAdmin]

    def get(self, request):
        revenue = Payment.objects.filter(
            status="SUCCESS"
        ).aggregate(total=Sum("amount"))["total"] or 0

        data = {
            "total_users": User.objects.count(),
            "total_students": StudentProfile.objects.count(),
            "total_teachers": TeacherProfile.objects.count(),
            "verified_teachers": TeacherProfile.objects.filter(
                verification_status="VERIFIED"
            ).count(),
            "pending_teachers": TeacherProfile.objects.filter(
                verification_status="PENDING"
            ).count(),
            "total_courses": Course.objects.count(),
            "published_courses": Course.objects.filter(
                status="PUBLISHED"
            ).count(),
            "pending_courses": Course.objects.filter(
                status="PENDING"
            ).count(),
            "total_enrollments": Enrollment.objects.count(),
            "total_payments": Payment.objects.count(),
            "successful_payments": Payment.objects.filter(
                status="SUCCESS"
            ).count(),
            "pending_payments": Payment.objects.filter(
                status="PENDING"
            ).count(),
            "failed_payments": Payment.objects.filter(
                status="FAILED"
            ).count(),
            "total_revenue": str(revenue),
        }

        return Response(data)


# ADMIN USER SERIALIZER
class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "role",
            "account_status",
            "is_active",
            "is_staff",
            "is_superuser",
            "date_joined",
        ]
        read_only_fields = [
            "id",
            "username",
            "email",
            "is_staff",
            "is_superuser",
            "date_joined",
        ]


# ADMIN: VIEW ALL USERS
class AdminUserListView(generics.ListAPIView):
    serializer_class = AdminUserSerializer
    permission_classes = [IsPlatformAdmin]

    def get_queryset(self):
        return User.objects.all().order_by("-date_joined")


# ADMIN: CHANGE USER ROLE OR ACCOUNT STATUS
class AdminUserStatusView(APIView):
    permission_classes = [IsPlatformAdmin]

    def patch(self, request, pk):
        user = generics.get_object_or_404(User, pk=pk)

        if user == request.user:
            return Response(
                {"detail": "You cannot change your own account here."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        role = request.data.get("role")
        account_status = request.data.get("account_status")

        if role is not None:
            if role not in ["student", "teacher", "admin"]:
                return Response(
                    {"detail": "Invalid user role."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            user.role = role

        if account_status is not None:
            if account_status not in ["ACTIVE", "SUSPENDED"]:
                return Response(
                    {"detail": "Invalid account status."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            user.account_status = account_status
            user.is_active = account_status == "ACTIVE"

        user.save()

        return Response({
            "message": "User updated successfully.",
            "user": AdminUserSerializer(user).data,
        })


# ADMIN ENROLLMENT SERIALIZER
class AdminEnrollmentSerializer(serializers.ModelSerializer):
    student_username = serializers.CharField(
        source="student.username",
        read_only=True,
    )
    course_title = serializers.CharField(
        source="course.title",
        read_only=True,
    )

    class Meta:
        model = Enrollment
        fields = [
            "id",
            "student",
            "student_username",
            "course",
            "course_title",
            "enrolled_at",
        ]


# ADMIN: VIEW ALL ENROLLMENTS
class AdminEnrollmentListView(generics.ListAPIView):
    serializer_class = AdminEnrollmentSerializer
    permission_classes = [IsPlatformAdmin]

    def get_queryset(self):
        return Enrollment.objects.select_related(
            "student", "course"
        ).order_by("-enrolled_at")


# ADMIN: DELETE AN ENROLLMENT
class AdminEnrollmentDeleteView(DestroyAPIView):
    serializer_class = AdminEnrollmentSerializer
    permission_classes = [IsAuthenticated, IsPlatformAdmin]
    queryset = Enrollment.objects.select_related(
        "student", "course"
    )
