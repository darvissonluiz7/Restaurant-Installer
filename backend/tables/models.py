import uuid
from django.db import models


class Table(models.Model):
    class Status(models.TextChoices):
        FREE = "free", "Livre"
        OCCUPIED = "occupied", "Ocupada"
        RESERVED = "reserved", "Reservada"
        CLEANING = "cleaning", "Aguardando Limpeza"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    number = models.PositiveIntegerField("Número", unique=True)
    capacity = models.PositiveIntegerField("Capacidade", default=4)
    status = models.CharField(
        "Status",
        max_length=20,
        choices=Status.choices,
        default=Status.FREE,
    )
    occupied_by = models.PositiveIntegerField("Pessoas sentadas", null=True, blank=True)
    reservation_time = models.TimeField("Horário da reserva", null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "tables"
        ordering = ["number"]
        verbose_name = "Mesa"
        verbose_name_plural = "Mesas"

    def __str__(self):
        return f"Mesa {self.number}"
