from rest_framework import viewsets, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response

from .models import Category, MenuItem
from .serializers import CategorySerializer, MenuItemSerializer, MenuItemListSerializer
from tables.models import Table
from tables.serializers import TableSerializer


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class MenuItemViewSet(viewsets.ModelViewSet):
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


# ── Customer ──────────────────────────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def customer_menu_view(request, table_number):
    """GET /api/customer/{table_number}/menu/"""
    try:
        table = Table.objects.get(number=table_number)
    except Table.DoesNotExist:
        return Response({"detail": "Mesa não encontrada."}, status=404)

    categories = Category.objects.prefetch_related("items").all()
    data = {"table": TableSerializer(table).data, "categories": []}

    for cat in categories:
        items = cat.items.filter(is_active=True).exclude(status=MenuItem.Status.OUT_OF_STOCK)
        if items.exists():
            data["categories"].append({
                "id": str(cat.id),
                "name": cat.name,
                "items": MenuItemListSerializer(items, many=True).data,
            })

    return Response(data)
