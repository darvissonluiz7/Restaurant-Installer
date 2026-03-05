from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import AcquirerConfig
from .serializers import AcquirerConfigSerializer, AcquirerConfigReadSerializer


@api_view(["GET"])
def acquirers_list_view(request):
    """GET /api/acquirers/ — lista adquirentes configurados (sem tokens)."""
    configs = AcquirerConfig.objects.all()
    return Response(AcquirerConfigReadSerializer(configs, many=True).data)


@api_view(["POST"])
def acquirer_save_view(request):
    """POST /api/acquirers/ — salva/atualiza configuração de um adquirente."""
    acquirer_type = request.data.get("acquirer_type")
    if not acquirer_type:
        return Response({"detail": "acquirer_type é obrigatório."}, status=400)

    try:
        instance = AcquirerConfig.objects.get(acquirer_type=acquirer_type)
        serializer = AcquirerConfigSerializer(instance, data=request.data, partial=True)
    except AcquirerConfig.DoesNotExist:
        serializer = AcquirerConfigSerializer(data=request.data)

    serializer.is_valid(raise_exception=True)
    config = serializer.save(is_active=True)
    return Response(AcquirerConfigReadSerializer(config).data, status=status.HTTP_200_OK)


@api_view(["DELETE"])
def acquirer_delete_view(request, pk):
    """DELETE /api/acquirers/{id}/ — remove configuração."""
    try:
        config = AcquirerConfig.objects.get(pk=pk)
    except AcquirerConfig.DoesNotExist:
        return Response({"detail": "Não encontrado."}, status=404)
    config.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
