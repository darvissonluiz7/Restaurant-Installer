from rest_framework import serializers
from .models import Review


class ReviewSerializer(serializers.ModelSerializer):
    table_number = serializers.IntegerField(source="table.number", read_only=True, default=None)

    class Meta:
        model = Review
        fields = ["id", "reviewer_name", "rating", "text", "table", "table_number", "is_visible", "created_at"]
        read_only_fields = ["is_visible"]


class ReviewCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ["reviewer_name", "rating", "text", "table"]
