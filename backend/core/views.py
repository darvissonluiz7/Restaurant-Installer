from decimal import Decimal

from django.contrib.auth import authenticate, login, logout
from django.db.models import Sum, Count, F
from django.middleware.csrf import get_token
from django.utils import timezone
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework import permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from .serializers import LoginSerializer, UserSerializer
from menu.models import MenuItem
from tables.models import Table
from orders.models import Order, OrderItem
from orders.serializers import OrderSerializer


# ── Auth ──────────────────────────────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([permissions.AllowAny])
@ensure_csrf_cookie
def csrf_view(request):
    return Response({"csrfToken": get_token(request)})


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = authenticate(
        request,
        username=serializer.validated_data["username"],
        password=serializer.validated_data["password"],
    )
    if user is None:
        return Response({"detail": "Credenciais invalidas."}, status=status.HTTP_401_UNAUTHORIZED)
    login(request, user)
    return Response(UserSerializer(user).data)


@api_view(["POST"])
def logout_view(request):
    logout(request)
    return Response({"detail": "Logout realizado com sucesso."})


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def me_view(request):
    if request.user.is_authenticated:
        return Response(UserSerializer(request.user).data)
    return Response({"detail": "Nao autenticado."}, status=status.HTTP_401_UNAUTHORIZED)


# ── Dashboard ─────────────────────────────────────────────────────────────────

@api_view(["GET"])
def dashboard_view(request):
    today_start = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)

    today_revenue = (
        Order.objects.filter(
            created_at__gte=today_start,
            status__in=[Order.Status.DELIVERED, Order.Status.READY, Order.Status.PREPARING],
        ).aggregate(total=Sum("total"))["total"]
        or Decimal("0")
    )

    today_orders = Order.objects.filter(created_at__gte=today_start).count()
    tables_total = Table.objects.count()
    tables_occupied = Table.objects.filter(status=Table.Status.OCCUPIED).count()

    delivered_today = Order.objects.filter(created_at__gte=today_start, status=Order.Status.DELIVERED)
    avg_seconds = 0
    if delivered_today.exists():
        times = [(o.updated_at - o.created_at).total_seconds() for o in delivered_today]
        avg_seconds = sum(times) / len(times)
    avg_time_minutes = int(avg_seconds // 60)

    popular_qs = (
        OrderItem.objects.filter(order__created_at__gte=today_start)
        .values("menu_item__name", "menu_item__emoji")
        .annotate(total_qty=Sum("quantity"), total_revenue=Sum(F("price") * F("quantity")))
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

    recent_orders = (
        Order.objects.select_related("table")
        .prefetch_related("items__menu_item")
        .filter(created_at__gte=today_start)
        .order_by("-created_at")[:10]
    )

    return Response({
        "today_revenue": today_revenue,
        "today_orders": today_orders,
        "tables_occupied": tables_occupied,
        "tables_total": tables_total,
        "avg_time_minutes": avg_time_minutes,
        "popular_items": popular_items,
        "recent_orders": OrderSerializer(recent_orders, many=True).data,
    })
