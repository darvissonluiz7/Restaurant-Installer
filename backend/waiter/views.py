from rest_framework import viewsets, status, permissions
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from django.utils import timezone

from .models import WaiterCall
from .serializers import WaiterCallSerializer
from tables.models import Table


class WaiterCallViewSet(viewsets.ModelViewSet):
    queryset = WaiterCall.objects.select_related("table").all()
    serializer_class = WaiterCallSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        pending_only = self.request.query_params.get("pending_only")
        if pending_only and pending_only.lower() in ("true", "1"):
            qs = qs.filter(status=WaiterCall.Status.PENDING)
        return qs

    @action(detail=True, methods=["patch"])
    def acknowledge(self, request, pk=None):
        """PATCH /api/waiter-calls/{id}/acknowledge/"""
        call = self.get_object()
        call.status = WaiterCall.Status.ACKNOWLEDGED
        call.resolved_at = timezone.now()
        call.save(update_fields=["status", "resolved_at"])
        return Response(WaiterCallSerializer(call).data)


# ── Customer ──────────────────────────────────────────────────────────────────

@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def customer_call_waiter_view(request, table_number):
    """POST /api/customer/{table_number}/call-waiter/"""
    try:
        table = Table.objects.get(number=table_number)
    except Table.DoesNotExist:
        return Response({"detail": "Mesa não encontrada."}, status=404)

    pending = WaiterCall.objects.filter(table=table, status=WaiterCall.Status.PENDING).exists()
    if pending:
        return Response(
            {"detail": "Já existe uma chamada pendente para esta mesa."},
            status=status.HTTP_409_CONFLICT,
        )

    call = WaiterCall.objects.create(table=table)
    return Response(WaiterCallSerializer(call).data, status=status.HTTP_201_CREATED)
