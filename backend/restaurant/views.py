from rest_framework import permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from .models import RestaurantInfo
from .serializers import RestaurantInfoSerializer


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def restaurant_info_view(request):
    """GET /api/restaurant/ — informações públicas do restaurante."""
    info = RestaurantInfo.get()
    return Response(RestaurantInfoSerializer(info).data)


@api_view(["PATCH"])
def restaurant_info_update_view(request):
    """PATCH /api/restaurant/ — atualiza informações (admin)."""
    info = RestaurantInfo.get()
    serializer = RestaurantInfoSerializer(info, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)
