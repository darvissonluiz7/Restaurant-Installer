"""
RestoPro — Django Admin configuration
"""

from django.contrib import admin
from .models import Category, MenuItem, Table, Order, OrderItem, WaiterCall


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "display_order", "created_at"]
    ordering = ["display_order"]


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ["price"]


@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = ["name", "category", "price", "status", "is_active"]
    list_filter = ["category", "status", "is_active"]
    search_fields = ["name"]


@admin.register(Table)
class TableAdmin(admin.ModelAdmin):
    list_display = ["number", "capacity", "status", "occupied_by"]
    list_filter = ["status"]


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ["display_id", "table", "origin", "status", "total", "created_at"]
    list_filter = ["status", "origin"]
    inlines = [OrderItemInline]
    readonly_fields = ["display_id"]


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ["order", "menu_item", "quantity", "price"]


@admin.register(WaiterCall)
class WaiterCallAdmin(admin.ModelAdmin):
    list_display = ["table", "status", "created_at", "resolved_at"]
    list_filter = ["status"]
