from rest_framework import serializers
from .models import LoyaltyReward, LoyaltyCard


class LoyaltyRewardSerializer(serializers.ModelSerializer):
    class Meta:
        model = LoyaltyReward
        fields = ["id", "name", "points_required", "emoji", "is_active", "display_order"]


class LoyaltyCardSerializer(serializers.ModelSerializer):
    class Meta:
        model = LoyaltyCard
        fields = ["id", "phone", "points", "created_at", "updated_at"]
