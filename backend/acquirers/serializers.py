from rest_framework import serializers
from .models import AcquirerConfig


class AcquirerConfigSerializer(serializers.ModelSerializer):
    acquirer_type_display = serializers.CharField(source="get_acquirer_type_display", read_only=True)
    # Nunca retorna o token na leitura
    access_token = serializers.CharField(write_only=True)

    class Meta:
        model = AcquirerConfig
        fields = [
            "id", "acquirer_type", "acquirer_type_display",
            "access_token", "public_key",
            "pix_enabled", "credit_enabled", "debit_enabled",
            "is_active", "created_at", "updated_at",
        ]


class AcquirerConfigReadSerializer(serializers.ModelSerializer):
    """Serializer de leitura — omite o token."""

    acquirer_type_display = serializers.CharField(source="get_acquirer_type_display", read_only=True)

    class Meta:
        model = AcquirerConfig
        fields = [
            "id", "acquirer_type", "acquirer_type_display",
            "pix_enabled", "credit_enabled", "debit_enabled",
            "is_active", "created_at", "updated_at",
        ]
