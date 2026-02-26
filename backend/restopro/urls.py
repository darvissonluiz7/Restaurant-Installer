"""RestoPro URL Configuration."""

from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve as static_serve
from pathlib import Path
from django.http import HttpResponse, Http404
import os

# Path to frontend build (set by Dockerfile or env)
FRONTEND_DIR = Path(os.getenv("FRONTEND_DIR", str(Path(settings.BASE_DIR).parent / "frontend" / "dist")))


def spa_view(request, path=""):
    """Serve the SPA index.html for any route that doesn't match API/admin/static/media."""
    # Try to serve a static file from frontend build
    file_path = FRONTEND_DIR / path
    if path and file_path.is_file():
        import mimetypes
        content_type, _ = mimetypes.guess_type(str(file_path))
        with open(file_path, "rb") as f:
            return HttpResponse(f.read(), content_type=content_type or "application/octet-stream")
    # Otherwise, serve index.html (SPA routing)
    index_path = FRONTEND_DIR / "index.html"
    if index_path.is_file():
        with open(index_path, "r") as f:
            return HttpResponse(f.read(), content_type="text/html")
    raise Http404("Frontend build not found")


urlpatterns = [
    path("django-admin/", admin.site.urls),
    path("api/", include("core.urls")),
]

# Serve media files
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
else:
    urlpatterns += [
        re_path(r"^media/(?P<path>.*)$", static_serve, {"document_root": settings.MEDIA_ROOT}),
    ]

# SPA catch-all — must be LAST
urlpatterns += [
    re_path(r"^(?P<path>.*)$", spa_view),
]
