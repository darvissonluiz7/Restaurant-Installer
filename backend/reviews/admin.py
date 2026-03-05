from django.contrib import admin
from .models import Review


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ["reviewer_name", "rating", "table", "is_visible", "created_at"]
    list_filter = ["rating", "is_visible"]
    search_fields = ["reviewer_name", "text"]
    actions = ["make_visible", "make_hidden"]

    @admin.action(description="Tornar visível")
    def make_visible(self, request, queryset):
        queryset.update(is_visible=True)

    @admin.action(description="Ocultar")
    def make_hidden(self, request, queryset):
        queryset.update(is_visible=False)
