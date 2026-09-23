"""
ForgeCloud Sample Application Service
A lightweight, containerized microservice demonstrating workload deployment,
monitoring, and health-check inspection in the ForgeCloud platform.
"""

import os
from fastapi import FastAPI, status

SERVICE_NAME = os.getenv("SERVICE_NAME", "sample-backend-service")
SERVICE_VERSION = os.getenv("SERVICE_VERSION", "v1.0.0")
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

app = FastAPI(
    title="ForgeCloud Sample Backend Service",
    description="Sample application microservice deployed on ForgeCloud",
    version=SERVICE_VERSION,
)


@app.get("/", tags=["Root"], status_code=status.HTTP_200_OK)
def root() -> dict:
    """Returns sample application service metadata and status."""
    return {
        "service": SERVICE_NAME,
        "version": SERVICE_VERSION,
        "status": "running",
        "environment": ENVIRONMENT,
        "platform": "ForgeCloud",
    }


@app.get("/health", tags=["Health"], status_code=status.HTTP_200_OK)
@app.get("/healthz", tags=["Health"], status_code=status.HTTP_200_OK)
def health_check() -> dict:
    """Service health check endpoint for container probes."""
    return {
        "status": "healthy",
        "service": SERVICE_NAME,
        "version": SERVICE_VERSION,
    }
