from django.utils import timezone
from rest_framework import serializers
from .models import Order, OrderItem
from tables.models import Table


class OrderItemSerializer(serializers.ModelSerializer):
    menu_item_name = serializers.CharField(source="menu_item.name", read_only=True)
    menu_item_emoji = serializers.CharField(source="menu_item.emoji", read_only=True)

    class Meta:
        model = OrderItem
        fields = ["id", "menu_item", "menu_item_name", "menu_item_emoji", "quantity", "price", "notes"]


class OrderItemCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ["menu_item", "quantity", "notes"]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    table_number = serializers.IntegerField(source="table.number", read_only=True, default=None)
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    origin_display = serializers.CharField(source="get_origin_display", read_only=True)
    time_elapsed = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            "id", "display_id", "table", "table_number",
            "origin", "origin_display", "status", "status_display",
            "total", "notes", "items", "time_elapsed",
            "created_at", "updated_at",
        ]

    def get_time_elapsed(self, obj):
        delta = timezone.now() - obj.created_at
        minutes = int(delta.total_seconds() // 60)
        if minutes < 1:
            return "Agora"
        if minutes < 60:
            return f"{minutes} min"
        hours = minutes // 60
        return f"{hours}h{minutes % 60:02d}"


class OrderCreateSerializer(serializers.Serializer):
    table = serializers.UUIDField(required=False, allow_null=True)
    origin = serializers.ChoiceField(choices=Order.Origin.choices, default=Order.Origin.TABLE)
    notes = serializers.CharField(required=False, default="", allow_blank=True)
    items = OrderItemCreateSerializer(many=True)

    def create(self, validated_data):
        items_data = validated_data.pop("items")
        table_id = validated_data.pop("table", None)

        table = None
        if table_id:
            table = Table.objects.get(pk=table_id)

        order = Order.objects.create(table=table, **validated_data)

        for item_data in items_data:
            menu_item = item_data["menu_item"]
            OrderItem.objects.create(
                order=order,
                menu_item=menu_item,
                quantity=item_data.get("quantity", 1),
                price=menu_item.price,
                notes=item_data.get("notes", ""),
            )

        order.recalculate_total()
        return order


class OrderStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Order.Status.choices)
