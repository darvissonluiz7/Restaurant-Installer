# ── Stage 1: Build frontend ─────────────────────────────────────────────
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install
COPY frontend/ ./
RUN npx vite build

# ── Stage 2: Python backend + serve frontend ───────────────────────────
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV FRONTEND_DIR=/app/frontend_dist

WORKDIR /app

# Install Python deps
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source
COPY backend/ .

# Copy frontend build output
COPY --from=frontend-build /app/frontend/dist /app/frontend_dist

# Collect static files (Django admin, DRF, etc.)
RUN DJANGO_SECRET_KEY=build-placeholder python manage.py collectstatic --noinput

# Create media dir
RUN mkdir -p /app/media

EXPOSE 8000

# Railway sets $PORT; default to 8000
CMD sh -c "python manage.py migrate --noinput && gunicorn restopro.wsgi --bind 0.0.0.0:${PORT:-8000} --workers 2 --timeout 120"
