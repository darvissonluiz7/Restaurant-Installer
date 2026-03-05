from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r"admin/reviews", views.ReviewViewSet)

urlpatterns = [
    path("", include(router.urls)),
    path("reviews/", views.public_reviews_view, name="reviews-list"),
    path("reviews/submit/", views.submit_review_view, name="reviews-submit"),
]
