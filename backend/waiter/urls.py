from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r"waiter-calls", views.WaiterCallViewSet)

urlpatterns = [
    path("", include(router.urls)),
    path(
        "customer/<int:table_number>/call-waiter/",
        views.customer_call_waiter_view,
        name="customer-call-waiter",
    ),
]
