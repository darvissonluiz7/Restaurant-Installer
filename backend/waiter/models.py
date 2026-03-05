import uuid
from django.db import models


class WaiterCall(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pendente"
        ACKNOWLEDGED = "acknowledged", "Atendido"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    table = models.ForeignKey(
        "tables.Table",
        on_delete=models.CASCADE,
        related_name="waiter_calls",
        verbose_name="Mesa",
    )
    status = models.CharField(
        "Status",
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "waiter_calls"
        ordering = ["-created_at"]
        verbose_name = "Chamada de Garçom"
        verbose_name_plural = "Chamadas de Garçom"

    def __str__(self):
        return f"Chamada — Mesa {self.table.number}"
