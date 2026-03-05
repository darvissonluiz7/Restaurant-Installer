import uuid
from django.db import models


class AcquirerConfig(models.Model):
    class AcquirerType(models.TextChoices):
        MERCADOPAGO = "mercadopago", "Mercado Pago"
        PAGBANK = "pagbank", "PagBank"
        INFINITEPAY = "infinitepay", "InfinitePay"
        PAGARME = "pagarme", "Pagar.me"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    acquirer_type = models.CharField(
        "Adquirente",
        max_length=20,
        choices=AcquirerType.choices,
        unique=True,
    )
    access_token = models.CharField("Access Token", max_length=500)
    public_key = models.CharField("Public Key", max_length=500, blank=True, default="")
    pix_enabled = models.BooleanField("Pix habilitado", default=True)
    credit_enabled = models.BooleanField("Crédito habilitado", default=True)
    debit_enabled = models.BooleanField("Débito habilitado", default=True)
    is_active = models.BooleanField("Ativo", default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "acquirer_configs"
        verbose_name = "Adquirente"
        verbose_name_plural = "Adquirentes"

    def __str__(self):
        return self.get_acquirer_type_display()
