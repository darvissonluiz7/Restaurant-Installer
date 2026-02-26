"""
RestoPro — URL routes (core app)
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r"categories", views.CategoryViewSet)
router.register(r"menu-items", views.MenuItemViewSet)
router.register(r"tables", views.TableViewSet)
router.register(r"orders", views.OrderViewSet)
router.register(r"waiter-calls", views.WaiterCallViewSet)

urlpatterns = [
    # Auth
    path("auth/csrf/", views.csrf_view, name="auth-csrf"),
    path("auth/login/", views.login_view, name="auth-login"),
    path("auth/logout/", views.logout_view, name="auth-logout"),
    path("auth/me/", views.me_view, name="auth-me"),

    # Dashboard
    path("dashboard/", views.dashboard_view, name="dashboard"),

    # Customer-facing endpoints (público)
    path(
        "customer/<int:table_number>/menu/",
        views.customer_menu_view,
        name="customer-menu",
    ),
    path(
        "customer/<int:table_number>/order/",
        views.customer_order_view,
        name="customer-order",
    ),
    path(
        "customer/<int:table_number>/call-waiter/",
        views.customer_call_waiter_view,
        name="customer-call-waiter",
    ),
    path(
        "customer/<int:table_number>/request-bill/",
        views.customer_request_bill_view,
        name="customer-request-bill",
    ),

    # Router-generated CRUD endpoints
    path("", include(router.urls)),
]
