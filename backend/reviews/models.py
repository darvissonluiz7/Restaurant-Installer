import uuid
from django.db import models


class Review(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    reviewer_name = models.CharField("Nome", max_length=100)
    rating = models.PositiveSmallIntegerField(
        "Nota",
        choices=[(i, str(i)) for i in range(1, 6)],
    )
    text = models.TextField("Comentário", blank=True, default="")
    table = models.ForeignKey(
        "tables.Table",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reviews",
        verbose_name="Mesa",
    )
    is_visible = models.BooleanField("Visível", default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "reviews"
        ordering = ["-created_at"]
        verbose_name = "Avaliação"
        verbose_name_plural = "Avaliações"

    def __str__(self):
        return f"{self.reviewer_name} — {self.rating}★"
