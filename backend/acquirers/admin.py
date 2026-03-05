from django.contrib import admin
from .models import AcquirerConfig


@admin.register(AcquirerConfig)
class AcquirerConfigAdmin(admin.ModelAdmin):
    list_display = ["acquirer_type", "is_active", "pix_enabled", "credit_enabled", "debit_enabled", "updated_at"]
    list_filter = ["is_active", "acquirer_type"]
