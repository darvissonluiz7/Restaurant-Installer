from django.contrib import admin
from .models import LoyaltyReward, LoyaltyCard


@admin.register(LoyaltyReward)
class LoyaltyRewardAdmin(admin.ModelAdmin):
    list_display = ["name", "points_required", "emoji", "is_active", "display_order"]
    list_filter = ["is_active"]


@admin.register(LoyaltyCard)
class LoyaltyCardAdmin(admin.ModelAdmin):
    list_display = ["phone", "points", "created_at", "updated_at"]
    search_fields = ["phone"]
