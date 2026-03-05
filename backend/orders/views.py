from rest_framework import viewsets, status, permissions
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from django.utils import timezone

from .models import Order, OrderItem
from .serializers import (
    OrderSerializer, OrderCreateSerializer, OrderStatusSerializer,
)
from tables.models import Table
from tables.serializers import TableSerializer


class OrderViewSet(viewsets.ModelViewSet):
    queryset = (
        Order.objects.select_related("table")
        .prefetch_related("items__menu_item")
        .all()
    )

    def get_serializer_class(self):
        if self.action == "create":
            return OrderCreateSerializer
        return OrderSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        status_filter = self.request.query_params.get("status")
        table = self.request.query_params.get("table")
        today_only = self.request.query_params.get("today_only")

        if status_filter:
            qs = qs.filter(status=status_filter)
        if table:
            qs = qs.filter(table_id=table)
        if today_only and today_only.lower() in ("true", "1"):
            today_start = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
            qs = qs.filter(created_at__gte=today_start)
        return qs

    def create(self, request, *args, **kwargs):
        serializer = OrderCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = serializer.save()

        if order.table:
            order.table.status = Table.Status.OCCUPIED
            order.table.save(update_fields=["status"])

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["patch"])
    def update_status(self, request, pk=None):
        """PATCH /api/orders/{id}/update_status/"""
        order = self.get_object()
        serializer = OrderStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        new_status = serializer.validated_data["status"]
        order.status = new_status
        order.save(update_fields=["status", "updated_at"])

        if new_status == Order.Status.DELIVERED and order.table:
            active = order.table.orders.exclude(
                status__in=[Order.Status.DELIVERED, Order.Status.CANCELLED]
            ).exists()
            if not active:
                order.table.status = Table.Status.CLEANING
                order.table.save(update_fields=["status"])

        return Response(OrderSerializer(order).data)

    @action(detail=False, methods=["get"])
    def by_table(self, request):
        """GET /api/orders/by_table/?table_number=4"""
        table_number = request.query_params.get("table_number")
        if not table_number:
            return Response({"detail": "table_number é obrigatório."}, status=status.HTTP_400_BAD_REQUEST)
        orders = self.get_queryset().filter(table__number=table_number).exclude(
            status__in=[Order.Status.DELIVERED, Order.Status.CANCELLED]
        )
        return Response(OrderSerializer(orders, many=True).data)


# ── Customer ──────────────────────────────────────────────────────────────────

@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def customer_order_view(request, table_number):
    """POST /api/customer/{table_number}/order/"""
    try:
        table = Table.objects.get(number=table_number)
    except Table.DoesNotExist:
        return Response({"detail": "Mesa não encontrada."}, status=404)

    data = {**request.data, "table": str(table.pk), "origin": Order.Origin.TABLE}
    serializer = OrderCreateSerializer(data=data)
    serializer.is_valid(raise_exception=True)
    order = serializer.save()

    table.status = Table.Status.OCCUPIED
    table.save(update_fields=["status"])

    return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def customer_orders_view(request, table_number):
    """GET /api/customer/{table_number}/orders/"""
    try:
        table = Table.objects.get(number=table_number)
    except Table.DoesNotExist:
        return Response({"detail": "Mesa não encontrada."}, status=404)

    orders = table.orders.prefetch_related("items__menu_item").order_by("-created_at")
    return Response(OrderSerializer(orders, many=True).data)


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def customer_request_bill_view(request, table_number):
    """POST /api/customer/{table_number}/request-bill/"""
    try:
        table = Table.objects.get(number=table_number)
    except Table.DoesNotExist:
        return Response({"detail": "Mesa não encontrada."}, status=404)

    active_orders = table.orders.exclude(
        status__in=[Order.Status.DELIVERED, Order.Status.CANCELLED]
    ).prefetch_related("items__menu_item")
    total = sum(o.total for o in active_orders)

    return Response({
        "table_number": table.number,
        "orders": OrderSerializer(active_orders, many=True).data,
        "total": str(total),
    })
