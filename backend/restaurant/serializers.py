from rest_framework import serializers
from .models import RestaurantInfo


class RestaurantInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = RestaurantInfo
        fields = [
            "id", "name", "description",
            "phone", "whatsapp", "email",
            "instagram", "facebook", "website",
            "address_street", "address_city", "address_state", "address_zip",
            "parking_available", "opening_hours", "updated_at",
        ]
