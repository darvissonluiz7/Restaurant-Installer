from django.db import models


class RestaurantInfo(models.Model):
    """Informações do restaurante — singleton (somente 1 registro)."""

    name = models.CharField("Nome", max_length=200, default="RestoPro")
    description = models.TextField("Descrição", blank=True, default="")
    phone = models.CharField("Telefone", max_length=20, blank=True, default="")
    whatsapp = models.CharField("WhatsApp", max_length=20, blank=True, default="")
    email = models.EmailField("E-mail", blank=True, default="")
    instagram = models.CharField("Instagram", max_length=100, blank=True, default="")
    facebook = models.CharField("Facebook", max_length=100, blank=True, default="")
    website = models.CharField("Website", max_length=200, blank=True, default="")
    address_street = models.CharField("Rua / Endereço", max_length=300, blank=True, default="")
    address_city = models.CharField("Cidade", max_length=100, blank=True, default="")
    address_state = models.CharField("Estado", max_length=2, blank=True, default="")
    address_zip = models.CharField("CEP", max_length=10, blank=True, default="")
    parking_available = models.BooleanField("Estacionamento disponível", default=False)
    # JSON: {"seg_qui": {"open": "11:00", "close": "23:00"}, "sex_sab": {...}, "dom": {...}}
    opening_hours = models.JSONField("Horário de funcionamento", default=dict, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "restaurant_info"
        verbose_name = "Informações do Restaurante"
        verbose_name_plural = "Informações do Restaurante"

    def __str__(self):
        return self.name

    @classmethod
    def get(cls):
        """Retorna o único registro (cria se não existir)."""
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj
