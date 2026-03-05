from django.contrib import admin
from .models import RestaurantInfo


@admin.register(RestaurantInfo)
class RestaurantInfoAdmin(admin.ModelAdmin):
    list_display = ["name", "phone", "email", "updated_at"]
