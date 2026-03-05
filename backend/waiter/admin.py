from django.contrib import admin
from .models import WaiterCall


@admin.register(WaiterCall)
class WaiterCallAdmin(admin.ModelAdmin):
    list_display = ["table", "status", "created_at", "resolved_at"]
    list_filter = ["status"]
