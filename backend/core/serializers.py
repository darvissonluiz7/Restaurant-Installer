from rest_framework import serializers
from django.contrib.auth.models import User
from orders.serializers import OrderSerializer


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "is_staff"]


class DashboardSerializer(serializers.Serializer):
    today_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    today_orders = serializers.IntegerField()
    tables_occupied = serializers.IntegerField()
    tables_total = serializers.IntegerField()
    avg_time_minutes = serializers.IntegerField()
    popular_items = serializers.ListField()
    recent_orders = OrderSerializer(many=True)
