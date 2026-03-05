from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r"admin/loyalty/rewards", views.LoyaltyRewardViewSet)

urlpatterns = [
    path("", include(router.urls)),
    path("loyalty/rewards/", views.rewards_list_view, name="loyalty-rewards"),
    path("loyalty/card/", views.loyalty_card_view, name="loyalty-card"),
    path("loyalty/redeem/", views.redeem_reward_view, name="loyalty-redeem"),
]
