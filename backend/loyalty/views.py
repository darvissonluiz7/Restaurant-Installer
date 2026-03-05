from rest_framework import viewsets, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from .models import LoyaltyReward, LoyaltyCard
from .serializers import LoyaltyRewardSerializer, LoyaltyCardSerializer


class LoyaltyRewardViewSet(viewsets.ModelViewSet):
    """Admin: CRUD de recompensas."""
    queryset = LoyaltyReward.objects.all()
    serializer_class = LoyaltyRewardSerializer


# ── Customer ──────────────────────────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def rewards_list_view(request):
    """GET /api/loyalty/rewards/ — lista recompensas ativas."""
    rewards = LoyaltyReward.objects.filter(is_active=True)
    return Response(LoyaltyRewardSerializer(rewards, many=True).data)


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def loyalty_card_view(request):
    """GET /api/loyalty/card/?phone=11999999999 — busca cartão por telefone."""
    phone = request.query_params.get("phone", "").strip()
    if not phone:
        return Response({"detail": "phone é obrigatório."}, status=400)

    card, created = LoyaltyCard.objects.get_or_create(phone=phone)
    return Response(LoyaltyCardSerializer(card).data)


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def redeem_reward_view(request):
    """POST /api/loyalty/redeem/ — resgata recompensa."""
    phone = request.data.get("phone", "").strip()
    reward_id = request.data.get("reward_id")

    if not phone or not reward_id:
        return Response({"detail": "phone e reward_id são obrigatórios."}, status=400)

    try:
        card = LoyaltyCard.objects.get(phone=phone)
        reward = LoyaltyReward.objects.get(pk=reward_id, is_active=True)
    except LoyaltyCard.DoesNotExist:
        return Response({"detail": "Cartão não encontrado."}, status=404)
    except LoyaltyReward.DoesNotExist:
        return Response({"detail": "Recompensa não encontrada."}, status=404)

    if card.points < reward.points_required:
        return Response(
            {"detail": f"Pontos insuficientes. Você tem {card.points} pts, precisa de {reward.points_required}."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    card.points -= reward.points_required
    card.save(update_fields=["points", "updated_at"])

    return Response({
        "detail": f"Recompensa '{reward.name}' resgatada com sucesso!",
        "card": LoyaltyCardSerializer(card).data,
    })
