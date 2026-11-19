
from django.contrib.auth import get_user_model
from django.db.models import Sum, Count, Q
from django.utils import timezone
from django.utils.crypto import get_random_string
from django.contrib.auth.hashers import make_password, check_password
from django.core.mail import send_mail
from datetime import timedelta
from rest_framework.throttling import AnonRateThrottle
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

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
from .models import PasswordResetCode
from .permissions import IsPlatformAdmin


User = get_user_model()


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


class EmailLoginView(TokenObtainPairView):
    serializer_class = EmailLoginSerializer
    permission_classes = [AllowAny]


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


class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [AnonRateThrottle]

    def post(self, request):
        email = str(request.data.get("email", "")).strip().lower()
        # Keep the response identical whether the account exists or not.
        user = User.objects.filter(email__iexact=email, is_active=True).first()
        if user:
            PasswordResetCode.objects.filter(user=user).delete()
            code = get_random_string(length=6, allowed_chars="0123456789")
            PasswordResetCode.objects.create(
                user=user,
                code_hash=make_password(code),
                expires_at=timezone.now() + timedelta(minutes=10),
            )
            try:
                send_mail(
                    subject="Your PATH NEXUS password reset code",
                    message=(f"Your password reset code is {code}. It expires in 10 minutes. "
                             "If you did not request this, you can ignore this email."),
                    from_email=None,
                    recipient_list=[user.email],
                    fail_silently=False,
                )
            except Exception:
                PasswordResetCode.objects.filter(user=user).delete()
                return Response(
                    {"detail": "We could not send the reset email. Check the Gmail SMTP configuration and try again."},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE,
                )
        return Response({"detail": "If an account exists for that email, a reset code has been sent."})


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [AnonRateThrottle]

    def post(self, request):
        email = str(request.data.get("email", "")).strip().lower()
        code = str(request.data.get("code", "")).strip()
        password = str(request.data.get("new_password", ""))
        if len(password) < 8:
            return Response({"new_password": "Use at least 8 characters."}, status=status.HTTP_400_BAD_REQUEST)
        reset = PasswordResetCode.objects.filter(
            user__email__iexact=email,
            expires_at__gt=timezone.now(),
        ).first()
        if not reset or reset.attempts >= 5 or not check_password(code, reset.code_hash):
            if reset:
                reset.attempts += 1
                reset.save(update_fields=["attempts"])
            return Response({"detail": "Invalid or expired reset code."}, status=status.HTTP_400_BAD_REQUEST)
        user = reset.user
        user.set_password(password)
        user.save(update_fields=["password"])
        PasswordResetCode.objects.filter(user=user).delete()
        return Response({"detail": "Password changed successfully. You can now sign in."})


class GoogleLoginView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [AnonRateThrottle]

    def post(self, request):
        credential = request.data.get("credential")
        client_id = getattr(__import__("django.conf", fromlist=[
                            "settings"]).settings, "GOOGLE_CLIENT_ID", "")
        if not credential or not client_id:
            return Response({"detail": "Google sign-in is not configured."}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        try:
            payload = id_token.verify_oauth2_token(
                credential, google_requests.Request(), client_id)
        except Exception:
            return Response({"detail": "Google credential is invalid or expired."}, status=status.HTTP_401_UNAUTHORIZED)
        email = str(payload.get("email", "")).lower()
        if not email or not payload.get("email_verified"):
            return Response({"detail": "A verified Google email is required."}, status=status.HTTP_400_BAD_REQUEST)
        user = User.objects.filter(email__iexact=email).first()
        if user is None:
            return Response({"detail": "No PATH NEXUS account exists for this email. Register first, then sign in with Google."}, status=status.HTTP_404_NOT_FOUND)
        if not user.is_active or user.account_status != "ACTIVE":
            return Response({"detail": "This account is inactive."}, status=status.HTTP_403_FORBIDDEN)
        refresh = __import__("rest_framework_simplejwt.tokens", fromlist=[
                             "RefreshToken"]).RefreshToken.for_user(user)
        from .permissions import is_platform_admin
        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": {
                "id": user.id, "username": user.username, "email": user.email,
                "role": "admin" if is_platform_admin(user) else user.role,
                "account_status": user.account_status,
                "is_email_verified": user.is_email_verified,
            },
        })
