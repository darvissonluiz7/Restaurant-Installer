from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Table
from .serializers import TableSerializer


class TableViewSet(viewsets.ModelViewSet):
    queryset = Table.objects.all()
    serializer_class = TableSerializer

    @action(detail=True, methods=["patch"])
    def update_status(self, request, pk=None):
        """PATCH /api/tables/{id}/update_status/"""
        table = self.get_object()
        new_status = request.data.get("status")
        if new_status not in dict(Table.Status.choices):
            return Response({"detail": "Status inválido."}, status=status.HTTP_400_BAD_REQUEST)
        table.status = new_status
        if new_status == Table.Status.FREE:
            table.occupied_by = None
            table.reservation_time = None
        table.save()
        return Response(TableSerializer(table).data)
