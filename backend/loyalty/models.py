import uuid
from django.db import models


class LoyaltyReward(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField("Nome", max_length=200)
    points_required = models.PositiveIntegerField("Pontos necessários")
    emoji = models.CharField("Emoji", max_length=10, default="🎁")
    is_active = models.BooleanField("Ativo", default=True)
    display_order = models.PositiveIntegerField("Ordem", default=0)

    class Meta:
        db_table = "loyalty_rewards"
        ordering = ["points_required", "display_order"]
        verbose_name = "Recompensa"
        verbose_name_plural = "Recompensas"

    def __str__(self):
        return f"{self.name} ({self.points_required} pts)"


class LoyaltyCard(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    phone = models.CharField("Telefone", max_length=20, unique=True)
    points = models.PositiveIntegerField("Pontos", default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "loyalty_cards"
        verbose_name = "Cartão Fidelidade"
        verbose_name_plural = "Cartões Fidelidade"

    def __str__(self):
        return f"{self.phone} — {self.points} pts"
