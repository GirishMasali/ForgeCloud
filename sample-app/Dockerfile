# ==============================================================================
# ForgeCloud Sample Application Production Multi-Stage Dockerfile
# Stage 1: Build stage for dependency installation
# Stage 2: Minimal, non-root Python 3.10-slim runtime container
# ==============================================================================

# --- Stage 1: Builder ---
FROM python:3.10-slim AS builder

WORKDIR /build

# Copy requirements and install to clean prefix
COPY sample-app/requirements.txt /build/requirements.txt
RUN pip install --no-cache-dir --prefix=/install -r /build/requirements.txt

# --- Stage 2: Production Runtime ---
FROM python:3.10-slim AS runtime

# Install curl for health check probing
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy installed libraries from builder stage
COPY --from=builder /install /usr/local

# Create dedicated non-root application user
RUN groupadd -g 10001 appuser && \
    useradd -u 10001 -g appuser -s /bin/bash -m appuser

# Set working directory
WORKDIR /app

# Copy sample service application code
COPY sample-app/app /app/app

# Set non-root ownership
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONPATH=/app \
    PORT=8080

# Expose sample application port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=10s --timeout=5s --start-period=5s --retries=5 \
    CMD curl -f http://localhost:8080/health || exit 1

# Production application entrypoint
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
