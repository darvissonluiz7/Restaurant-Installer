from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r"tables", views.TableViewSet)

urlpatterns = [
    path("tables/public/", views.public_tables),
    path("", include(router.urls)),
]
