from rest_framework import serializers
from .models import Category, MenuItem


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "display_order", "created_at"]


class MenuItemSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = MenuItem
        fields = [
            "id", "name", "description", "price",
            "category", "category_name", "image", "emoji",
            "status", "is_active", "created_at", "updated_at",
        ]


class MenuItemListSerializer(serializers.ModelSerializer):
    """Versão leve para listagens e cardápio do cliente."""

    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = MenuItem
        fields = [
            "id", "name", "description", "price",
            "category", "category_name", "emoji", "status", "image", "is_active",
        ]
