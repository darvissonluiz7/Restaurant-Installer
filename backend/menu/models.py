import uuid
import os
from django.db import models


def menu_image_upload(instance, filename):
    ext = os.path.splitext(filename)[1].lower() or ".jpg"
    return f"menu/{uuid.uuid4().hex}{ext}"


class Category(models.Model):
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
    image = models.ImageField("Imagem", upload_to=menu_image_upload, blank=True, null=True, max_length=500)
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
