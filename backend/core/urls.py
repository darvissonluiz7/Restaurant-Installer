from django.urls import path
from . import views

urlpatterns = [
    path("auth/csrf/", views.csrf_view, name="auth-csrf"),
    path("auth/login/", views.login_view, name="auth-login"),
    path("auth/logout/", views.logout_view, name="auth-logout"),
    path("auth/me/", views.me_view, name="auth-me"),
    path("dashboard/", views.dashboard_view, name="dashboard"),
    path("ai/generate-dish/", views.ai_generate_dish, name="ai-generate-dish"),
]
