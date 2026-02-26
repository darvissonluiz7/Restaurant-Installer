"""
RestoPro — Serializers
"""

from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Category, MenuItem, Table, Order, OrderItem, WaiterCall


# ── Auth ─────────────────────────────────────────────────────────────────────

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name"]


# ── Category ─────────────────────────────────────────────────────────────────

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "display_order", "created_at"]


# ── MenuItem ─────────────────────────────────────────────────────────────────

class MenuItemSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = MenuItem
        fields = [
            "id",
            "name",
            "description",
            "price",
            "category",
            "category_name",
            "image",
            "emoji",
            "status",
            "is_active",
            "created_at",
            "updated_at",
        ]

    def get_status_display(self, obj):
        return obj.get_status_display()


class MenuItemListSerializer(serializers.ModelSerializer):
    """Versão mais leve para listagens."""

    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = MenuItem
        fields = [
            "id",
            "name",
            "description",
            "price",
            "category",
            "category_name",
            "emoji",
            "status",
            "image",
            "is_active",
        ]


# ── Table ────────────────────────────────────────────────────────────────────

class TableSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    current_amount = serializers.SerializerMethodField()

    class Meta:
        model = Table
        fields = [
            "id",
            "number",
            "capacity",
            "status",
            "status_display",
            "occupied_by",
            "reservation_time",
            "current_amount",
            "created_at",
            "updated_at",
        ]

    def get_current_amount(self, obj):
        """Valor parcial gasto na mesa (pedidos ativos)."""
        active_orders = obj.orders.exclude(
            status__in=[Order.Status.CANCELLED, Order.Status.DELIVERED]
        )
        return str(sum(o.total for o in active_orders))


# ── OrderItem ────────────────────────────────────────────────────────────────

class OrderItemSerializer(serializers.ModelSerializer):
    menu_item_name = serializers.CharField(source="menu_item.name", read_only=True)
    menu_item_emoji = serializers.CharField(source="menu_item.emoji", read_only=True)

    class Meta:
        model = OrderItem
        fields = [
            "id",
            "menu_item",
            "menu_item_name",
            "menu_item_emoji",
            "quantity",
            "price",
            "notes",
        ]


class OrderItemCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ["menu_item", "quantity", "notes"]


# ── Order ────────────────────────────────────────────────────────────────────

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    table_number = serializers.IntegerField(source="table.number", read_only=True, default=None)
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    origin_display = serializers.CharField(source="get_origin_display", read_only=True)
    time_elapsed = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            "id",
            "display_id",
            "table",
            "table_number",
            "origin",
            "origin_display",
            "status",
            "status_display",
            "total",
            "notes",
            "items",
            "time_elapsed",
            "created_at",
            "updated_at",
        ]

    def get_time_elapsed(self, obj):
        from django.utils import timezone

        delta = timezone.now() - obj.created_at
        minutes = int(delta.total_seconds() // 60)
        if minutes < 1:
            return "Agora"
        if minutes < 60:
            return f"{minutes} min"
        hours = minutes // 60
        return f"{hours}h{minutes % 60:02d}"


class OrderCreateSerializer(serializers.Serializer):
    """Serializer para criação de pedidos — aceita itens inline."""

    table = serializers.UUIDField(required=False, allow_null=True)
    origin = serializers.ChoiceField(
        choices=Order.Origin.choices, default=Order.Origin.TABLE
    )
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
    """Serializer para atualizar status."""

    status = serializers.ChoiceField(choices=Order.Status.choices)


# ── WaiterCall ───────────────────────────────────────────────────────────────

class WaiterCallSerializer(serializers.ModelSerializer):
    table_number = serializers.IntegerField(source="table.number", read_only=True)

    class Meta:
        model = WaiterCall
        fields = ["id", "table", "table_number", "status", "created_at", "resolved_at"]


# ── Dashboard ────────────────────────────────────────────────────────────────

class DashboardSerializer(serializers.Serializer):
    """Serializer para os dados do dashboard."""

    today_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    today_orders = serializers.IntegerField()
    tables_occupied = serializers.IntegerField()
    tables_total = serializers.IntegerField()
    avg_time_minutes = serializers.IntegerField()
    popular_items = serializers.ListField()
    recent_orders = OrderSerializer(many=True)
