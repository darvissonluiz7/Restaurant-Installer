"""
RestoPro — Models

Modelos principais:
- Category: Categorias do cardápio (Pratos Principais, Bebidas, etc.)
- MenuItem: Itens do cardápio
- Table: Mesas do restaurante
- Order: Pedidos
- OrderItem: Itens de um pedido
- WaiterCall: Chamadas de garçom
"""

import uuid
from django.db import models
from django.contrib.auth.models import User


class Category(models.Model):
    """Categoria do cardápio."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField("Nome", max_length=100, unique=True)
    display_order = models.PositiveIntegerField("Ordem de exibição", default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "categories"
        ordering = ["display_order", "name"]
        verbose_name = "Categoria"
        verbose_name_plural = "Categorias"

    def __str__(self):
        return self.name


class MenuItem(models.Model):
    """Item do cardápio."""

    class Status(models.TextChoices):
        AVAILABLE = "available", "Disponível"
        LOW_STOCK = "low_stock", "Pouco Estoque"
        OUT_OF_STOCK = "out_of_stock", "Esgotado"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField("Nome", max_length=200)
    description = models.TextField("Descrição", blank=True, default="")
    price = models.DecimalField("Preço", max_digits=10, decimal_places=2)
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name="items",
        verbose_name="Categoria",
    )
    image = models.ImageField("Imagem", upload_to="menu/", blank=True, null=True)
    emoji = models.CharField("Emoji", max_length=10, blank=True, default="🍽️")
    status = models.CharField(
        "Status",
        max_length=20,
        choices=Status.choices,
        default=Status.AVAILABLE,
    )
    is_active = models.BooleanField("Ativo", default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "menu_items"
        ordering = ["category__display_order", "name"]
        verbose_name = "Item do Cardápio"
        verbose_name_plural = "Itens do Cardápio"

    def __str__(self):
        return f"{self.name} — R$ {self.price}"


class Table(models.Model):
    """Mesa do restaurante."""

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


class Order(models.Model):
    """Pedido."""

    class Status(models.TextChoices):
        NEW = "new", "Novo"
        PREPARING = "preparing", "Preparando"
        READY = "ready", "Pronto"
        DELIVERED = "delivered", "Entregue"
        CANCELLED = "cancelled", "Cancelado"

    class Origin(models.TextChoices):
        TABLE = "table", "Mesa"
        DELIVERY = "delivery", "Delivery"
        COUNTER = "counter", "Balcão"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    display_id = models.PositiveIntegerField("Número do Pedido", unique=True, editable=False)
    table = models.ForeignKey(
        Table,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="orders",
        verbose_name="Mesa",
    )
    origin = models.CharField(
        "Origem",
        max_length=20,
        choices=Origin.choices,
        default=Origin.TABLE,
    )
    status = models.CharField(
        "Status",
        max_length=20,
        choices=Status.choices,
        default=Status.NEW,
    )
    total = models.DecimalField("Total", max_digits=10, decimal_places=2, default=0)
    notes = models.TextField("Observações", blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "orders"
        ordering = ["-created_at"]
        verbose_name = "Pedido"
        verbose_name_plural = "Pedidos"

    def __str__(self):
        return f"Pedido #{self.display_id}"

    def save(self, *args, **kwargs):
        if not self.display_id:
            last = Order.objects.order_by("-display_id").first()
            self.display_id = (last.display_id + 1) if last else 1001
        super().save(*args, **kwargs)

    def recalculate_total(self):
        """Recalcula o total com base nos itens."""
        self.total = sum(
            item.price * item.quantity for item in self.items.all()
        )
        self.save(update_fields=["total"])


class OrderItem(models.Model):
    """Item de um pedido."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="items",
        verbose_name="Pedido",
    )
    menu_item = models.ForeignKey(
        MenuItem,
        on_delete=models.PROTECT,
        related_name="order_items",
        verbose_name="Item do Cardápio",
    )
    quantity = models.PositiveIntegerField("Quantidade", default=1)
    price = models.DecimalField(
        "Preço unitário",
        max_digits=10,
        decimal_places=2,
        help_text="Preço no momento do pedido",
    )
    notes = models.TextField("Observações", blank=True, default="")

    class Meta:
        db_table = "order_items"
        verbose_name = "Item do Pedido"
        verbose_name_plural = "Itens do Pedido"

    def __str__(self):
        return f"{self.quantity}x {self.menu_item.name}"


class WaiterCall(models.Model):
    """Chamada de garçom."""

    class Status(models.TextChoices):
        PENDING = "pending", "Pendente"
        ACKNOWLEDGED = "acknowledged", "Atendido"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    table = models.ForeignKey(
        Table,
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
