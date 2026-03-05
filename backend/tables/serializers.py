from rest_framework import serializers
from .models import Table
from orders.models import Order


class TableSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    current_amount = serializers.SerializerMethodField()

    class Meta:
        model = Table
        fields = [
            "id", "number", "capacity", "status", "status_display",
            "occupied_by", "reservation_time", "current_amount",
            "created_at", "updated_at",
        ]

    def get_current_amount(self, obj):
        active_orders = obj.orders.exclude(
            status__in=[Order.Status.CANCELLED, Order.Status.DELIVERED]
        )
        return str(sum(o.total for o in active_orders))
