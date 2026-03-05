from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r"orders", views.OrderViewSet)

urlpatterns = [
    path("", include(router.urls)),
    path("customer/<int:table_number>/order/", views.customer_order_view, name="customer-order"),
    path("customer/<int:table_number>/orders/", views.customer_orders_view, name="customer-orders"),
    path("customer/<int:table_number>/request-bill/", views.customer_request_bill_view, name="customer-request-bill"),
]
