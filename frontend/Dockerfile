# ==============================================================================
# ForgeCloud Frontend Production Multi-Stage Dockerfile
# Stage 1: Build stage with Node.js to compile Vite React production bundle
# Stage 2: Minimal Nginx Alpine container serving static assets & API proxy
# ==============================================================================

# --- Stage 1: Builder ---
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency specifications
COPY frontend/package.json frontend/package-lock.json ./

# Install dependencies deterministically
RUN npm ci || npm install

# Copy application source code
COPY frontend/ ./

# Build production distribution bundle
RUN npm run build

# --- Stage 2: Production Nginx Runtime ---
FROM nginx:alpine AS runtime

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy compiled static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration with SPA routing and API reverse proxy
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port
EXPOSE 80

# Container healthcheck
HEALTHCHECK --interval=10s --timeout=5s --start-period=5s --retries=5 \
    CMD wget -q -O - http://127.0.0.1/healthz || exit 1

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
