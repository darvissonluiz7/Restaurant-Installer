"""
RestoPro — Views (API endpoints)
"""

from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import authenticate, login, logout
from django.db.models import Sum, Avg, Count, F, Q
from django.middleware.csrf import get_token
from django.utils import timezone
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_exempt
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import api_view, action, permission_classes
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response

from .models import Category, MenuItem, Table, Order, OrderItem, WaiterCall
from .serializers import (
    LoginSerializer,
    UserSerializer,
    CategorySerializer,
    MenuItemSerializer,
    MenuItemListSerializer,
    TableSerializer,
    OrderSerializer,
    OrderCreateSerializer,
    OrderStatusSerializer,
    WaiterCallSerializer,
    DashboardSerializer,
)


# ── Auth ─────────────────────────────────────────────────────────────────────


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
@ensure_csrf_cookie
def csrf_view(request):
    """GET /api/auth/csrf/ — define o cookie CSRF e devolve o token."""
    return Response({"csrfToken": get_token(request)})


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def login_view(request):
    """POST /api/auth/login/"""
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    user = authenticate(
        request,
        username=serializer.validated_data["username"],
        password=serializer.validated_data["password"],
    )

    if user is None:
        return Response(
            {"detail": "Credenciais inválidas."}, status=status.HTTP_401_UNAUTHORIZED
        )

    login(request, user)
    return Response(UserSerializer(user).data)


@api_view(["POST"])
def logout_view(request):
    """POST /api/auth/logout/"""
    logout(request)
    return Response({"detail": "Logout realizado com sucesso."})


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def me_view(request):
    """GET /api/auth/me/ — retorna o usuário autenticado."""
    if request.user.is_authenticated:
        return Response(UserSerializer(request.user).data)
    return Response({"detail": "Não autenticado."}, status=status.HTTP_401_UNAUTHORIZED)


# ── Dashboard ────────────────────────────────────────────────────────────────


@api_view(["GET"])
def dashboard_view(request):
    """GET /api/dashboard/ — dados agregados para o painel."""
    today_start = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)

    # Receita de hoje (pedidos entregues)
    today_revenue = (
        Order.objects.filter(
            created_at__gte=today_start,
            status__in=[Order.Status.DELIVERED, Order.Status.READY, Order.Status.PREPARING],
        ).aggregate(total=Sum("total"))["total"]
        or Decimal("0")
    )

    # Pedidos de hoje
    today_orders = Order.objects.filter(created_at__gte=today_start).count()

    # Mesas
    tables_total = Table.objects.count()
    tables_occupied = Table.objects.filter(status=Table.Status.OCCUPIED).count()

    # Tempo médio (pedidos de hoje finalizados)
    delivered_today = Order.objects.filter(
        created_at__gte=today_start, status=Order.Status.DELIVERED
    )
    avg_seconds = 0
    if delivered_today.exists():
        times = [
            (o.updated_at - o.created_at).total_seconds() for o in delivered_today
        ]
        avg_seconds = sum(times) / len(times)
    avg_time_minutes = int(avg_seconds // 60)

    # Pratos populares (top 5 do dia)
    popular_qs = (
        OrderItem.objects.filter(order__created_at__gte=today_start)
        .values("menu_item__name", "menu_item__emoji")
        .annotate(
            total_qty=Sum("quantity"),
            total_revenue=Sum(F("price") * F("quantity")),
        )
        .order_by("-total_qty")[:5]
    )
    popular_items = [
        {
            "name": p["menu_item__name"],
            "emoji": p["menu_item__emoji"],
            "sales": p["total_qty"],
            "revenue": str(p["total_revenue"]),
        }
        for p in popular_qs
    ]

    # Pedidos recentes
    recent_orders = Order.objects.select_related("table").prefetch_related(
        "items__menu_item"
    ).filter(created_at__gte=today_start).order_by("-created_at")[:10]

    data = {
        "today_revenue": today_revenue,
        "today_orders": today_orders,
        "tables_occupied": tables_occupied,
        "tables_total": tables_total,
        "avg_time_minutes": avg_time_minutes,
        "popular_items": popular_items,
        "recent_orders": OrderSerializer(recent_orders, many=True).data,
    }
    return Response(data)


# ── Categories ───────────────────────────────────────────────────────────────


class CategoryViewSet(viewsets.ModelViewSet):
    """CRUD de categorias."""

    queryset = Category.objects.all()
    serializer_class = CategorySerializer


# ── Menu Items ───────────────────────────────────────────────────────────────


class MenuItemViewSet(viewsets.ModelViewSet):
    """CRUD de itens do cardápio."""

    queryset = MenuItem.objects.select_related("category").all()
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_serializer_class(self):
        if self.action == "list":
            return MenuItemListSerializer
        return MenuItemSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        category = self.request.query_params.get("category")
        search = self.request.query_params.get("search")
        status_filter = self.request.query_params.get("status")
        active_only = self.request.query_params.get("active_only")

        if category:
            qs = qs.filter(category_id=category)
        if search:
            qs = qs.filter(name__icontains=search)
        if status_filter:
            qs = qs.filter(status=status_filter)
        if active_only and active_only.lower() in ("true", "1"):
            qs = qs.filter(is_active=True)

        return qs


# ── Tables ───────────────────────────────────────────────────────────────────


class TableViewSet(viewsets.ModelViewSet):
    """CRUD de mesas."""

    queryset = Table.objects.all()
    serializer_class = TableSerializer

    @action(detail=True, methods=["patch"])
    def update_status(self, request, pk=None):
        """PATCH /api/tables/{id}/update_status/"""
        table = self.get_object()
        new_status = request.data.get("status")
        if new_status not in dict(Table.Status.choices):
            return Response(
                {"detail": "Status inválido."}, status=status.HTTP_400_BAD_REQUEST
            )
        table.status = new_status
        if new_status == Table.Status.FREE:
            table.occupied_by = None
            table.reservation_time = None
        table.save()
        return Response(TableSerializer(table).data)


# ── Orders ───────────────────────────────────────────────────────────────────


class OrderViewSet(viewsets.ModelViewSet):
    """CRUD de pedidos."""

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
            today_start = timezone.now().replace(
                hour=0, minute=0, second=0, microsecond=0
            )
            qs = qs.filter(created_at__gte=today_start)

        return qs

    def create(self, request, *args, **kwargs):
        serializer = OrderCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = serializer.save()

        # Se veio de uma mesa, atualizar status da mesa
        if order.table:
            order.table.status = Table.Status.OCCUPIED
            order.table.save(update_fields=["status"])

        return Response(
            OrderSerializer(order).data, status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=["patch"])
    def update_status(self, request, pk=None):
        """PATCH /api/orders/{id}/update_status/ — muda status do pedido."""
        order = self.get_object()
        serializer = OrderStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        new_status = serializer.validated_data["status"]
        order.status = new_status
        order.save(update_fields=["status", "updated_at"])

        # Se entregue, pode liberar a mesa
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
        """GET /api/orders/by_table/?table_number=4 — pedidos ativos de uma mesa."""
        table_number = request.query_params.get("table_number")
        if not table_number:
            return Response(
                {"detail": "table_number é obrigatório."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        orders = self.get_queryset().filter(
            table__number=table_number
        ).exclude(status__in=[Order.Status.DELIVERED, Order.Status.CANCELLED])
        return Response(OrderSerializer(orders, many=True).data)


# ── WaiterCall ───────────────────────────────────────────────────────────────


class WaiterCallViewSet(viewsets.ModelViewSet):
    """Chamadas de garçom."""

    queryset = WaiterCall.objects.select_related("table").all()
    serializer_class = WaiterCallSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        pending_only = self.request.query_params.get("pending_only")
        if pending_only and pending_only.lower() in ("true", "1"):
            qs = qs.filter(status=WaiterCall.Status.PENDING)
        return qs

    @action(detail=True, methods=["patch"])
    def acknowledge(self, request, pk=None):
        """PATCH /api/waiter-calls/{id}/acknowledge/ — marca como atendido."""
        call = self.get_object()
        call.status = WaiterCall.Status.ACKNOWLEDGED
        call.resolved_at = timezone.now()
        call.save(update_fields=["status", "resolved_at"])
        return Response(WaiterCallSerializer(call).data)


# ── Customer (público) ───────────────────────────────────────────────────────


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def customer_menu_view(request, table_number):
    """GET /api/customer/{table_number}/menu/ — cardápio para o cliente."""
    try:
        table = Table.objects.get(number=table_number)
    except Table.DoesNotExist:
        return Response(
            {"detail": "Mesa não encontrada."}, status=status.HTTP_404_NOT_FOUND
        )

    categories = Category.objects.prefetch_related(
        "items"
    ).all()

    data = {
        "table": TableSerializer(table).data,
        "categories": [],
    }

    for cat in categories:
        items = cat.items.filter(is_active=True).exclude(
            status=MenuItem.Status.OUT_OF_STOCK
        )
        if items.exists():
            data["categories"].append(
                {
                    "id": str(cat.id),
                    "name": cat.name,
                    "items": MenuItemListSerializer(items, many=True).data,
                }
            )

    return Response(data)


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def customer_order_view(request, table_number):
    """POST /api/customer/{table_number}/order/ — cliente faz pedido."""
    try:
        table = Table.objects.get(number=table_number)
    except Table.DoesNotExist:
        return Response(
            {"detail": "Mesa não encontrada."}, status=status.HTTP_404_NOT_FOUND
        )

    data = {
        **request.data,
        "table": str(table.pk),
        "origin": Order.Origin.TABLE,
    }
    serializer = OrderCreateSerializer(data=data)
    serializer.is_valid(raise_exception=True)
    order = serializer.save()

    # Ocupar mesa
    table.status = Table.Status.OCCUPIED
    table.save(update_fields=["status"])

    return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def customer_orders_view(request, table_number):
    """GET /api/customer/{table_number}/orders/ — lista pedidos da mesa."""
    try:
        table = Table.objects.get(number=table_number)
    except Table.DoesNotExist:
        return Response(
            {"detail": "Mesa não encontrada."}, status=status.HTTP_404_NOT_FOUND
        )

    orders = table.orders.all().order_by("-created_at")
    return Response(OrderSerializer(orders, many=True).data)


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def customer_call_waiter_view(request, table_number):
    """POST /api/customer/{table_number}/call-waiter/ — chamar garçom."""
    try:
        table = Table.objects.get(number=table_number)
    except Table.DoesNotExist:
        return Response(
            {"detail": "Mesa não encontrada."}, status=status.HTTP_404_NOT_FOUND
        )

    # Evitar chamadas duplicadas pendentes
    pending = WaiterCall.objects.filter(
        table=table, status=WaiterCall.Status.PENDING
    ).exists()
    if pending:
        return Response(
            {"detail": "Já existe uma chamada pendente para esta mesa."},
            status=status.HTTP_409_CONFLICT,
        )

    call = WaiterCall.objects.create(table=table)
    return Response(WaiterCallSerializer(call).data, status=status.HTTP_201_CREATED)


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def customer_request_bill_view(request, table_number):
    """POST /api/customer/{table_number}/request-bill/ — pedir a conta."""
    try:
        table = Table.objects.get(number=table_number)
    except Table.DoesNotExist:
        return Response(
            {"detail": "Mesa não encontrada."}, status=status.HTTP_404_NOT_FOUND
        )

    active_orders = table.orders.exclude(
        status__in=[Order.Status.DELIVERED, Order.Status.CANCELLED]
    )
    total = sum(o.total for o in active_orders)

    return Response(
        {
            "table_number": table.number,
            "orders": OrderSerializer(active_orders, many=True).data,
            "total": str(total),
        }
    )
