import uuid
from django.db import models


class Order(models.Model):
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
        "tables.Table",
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
        self.total = sum(item.price * item.quantity for item in self.items.all())
        self.save(update_fields=["total"])


class OrderItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="items",
        verbose_name="Pedido",
    )
    menu_item = models.ForeignKey(
        "menu.MenuItem",
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
