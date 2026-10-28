
from rest_framework import serializers
from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            "id",
            "student",
            "course",
            "amount",
            "phone_number",
            "checkout_request_id",
            "merchant_request_id",
            "mpesa_receipt_number",
            "status",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "student",
            "amount",
            "checkout_request_id",
            "merchant_request_id",
            "mpesa_receipt_number",
            "status",
            "created_at",
        ]
