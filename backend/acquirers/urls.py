from django.urls import path
from . import views

urlpatterns = [
    path("acquirers/", views.acquirers_list_view, name="acquirers-list"),
    path("acquirers/save/", views.acquirer_save_view, name="acquirers-save"),
    path("acquirers/<uuid:pk>/", views.acquirer_delete_view, name="acquirers-delete"),
]
