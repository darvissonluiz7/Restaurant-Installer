from django.urls import path
from . import views

urlpatterns = [
    path("restaurant/", views.restaurant_info_view, name="restaurant-info"),
    path("restaurant/update/", views.restaurant_info_update_view, name="restaurant-update"),
]
