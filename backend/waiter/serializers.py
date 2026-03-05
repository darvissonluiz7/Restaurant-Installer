from rest_framework import serializers
from .models import WaiterCall


class WaiterCallSerializer(serializers.ModelSerializer):
    table_number = serializers.IntegerField(source="table.number", read_only=True)

    class Meta:
        model = WaiterCall
        fields = ["id", "table", "table_number", "status", "created_at", "resolved_at"]
