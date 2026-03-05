from django.contrib import admin
from .models import Category, MenuItem


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "display_order", "created_at"]
    ordering = ["display_order"]


@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = ["name", "category", "price", "status", "is_active"]
    list_filter = ["category", "status", "is_active"]
    search_fields = ["name"]
