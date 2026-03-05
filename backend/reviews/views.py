from rest_framework import viewsets, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Avg, Count

from .models import Review
from .serializers import ReviewSerializer, ReviewCreateSerializer


class ReviewViewSet(viewsets.ModelViewSet):
    """Admin: listar, moderar e deletar avaliações."""

    queryset = Review.objects.select_related("table").all()
    serializer_class = ReviewSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        visible_only = self.request.query_params.get("visible_only")
        if visible_only and visible_only.lower() in ("true", "1"):
            qs = qs.filter(is_visible=True)
        return qs


# ── Customer ──────────────────────────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def public_reviews_view(request):
    """GET /api/reviews/ — lista avaliações visíveis + estatísticas."""
    reviews = Review.objects.filter(is_visible=True).select_related("table")
    stats = reviews.aggregate(avg_rating=Avg("rating"), total=Count("id"))

    return Response({
        "avg_rating": round(stats["avg_rating"] or 0, 1),
        "total": stats["total"],
        "reviews": ReviewSerializer(reviews, many=True).data,
    })


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def submit_review_view(request):
    """POST /api/reviews/ — cliente envia avaliação."""
    serializer = ReviewCreateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    review = serializer.save()
    return Response(ReviewSerializer(review).data, status=status.HTTP_201_CREATED)
