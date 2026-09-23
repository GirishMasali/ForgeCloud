# ==============================================================================
# ForgeCloud Backend Production Multi-Stage Dockerfile
# Stage 1: Build stage for dependency compilation and isolation
# Stage 2: Minimal, non-root Python 3.10-slim runtime container
# ==============================================================================

# --- Stage 1: Builder ---
FROM python:3.10-slim AS builder

WORKDIR /build

# Install compilation prerequisites
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy dependency specification and install into standalone prefix
COPY backend/requirements.txt /build/requirements.txt
RUN pip install --no-cache-dir --prefix=/install -r /build/requirements.txt

# --- Stage 2: Production Runtime ---
FROM python:3.10-slim AS runtime

# Install runtime dependencies: curl for health checks, libpq5 for PostgreSQL
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Copy installed python wheels/libraries from builder stage
COPY --from=builder /install /usr/local

# Create dedicated non-root application user
RUN groupadd -g 10001 appuser && \
    useradd -u 10001 -g appuser -s /bin/bash -m appuser

# Set working directory
WORKDIR /app

# Copy application and database migration modules
COPY backend /app/backend
COPY database /app/database

# Set ownership to non-root user
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONPATH=/app \
    PORT=8000

# Expose FastAPI application port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=10s --timeout=5s --start-period=5s --retries=5 \
    CMD curl -f http://localhost:8000/api/health || exit 1

# Production application entrypoint
CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
