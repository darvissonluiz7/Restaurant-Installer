from django.contrib import admin
from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ["price"]


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ["display_id", "table", "origin", "status", "total", "created_at"]
    list_filter = ["status", "origin"]
    inlines = [OrderItemInline]
    readonly_fields = ["display_id"]


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ["order", "menu_item", "quantity", "price"]
