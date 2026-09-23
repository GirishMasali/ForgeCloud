"""
ForgeCloud Control Plane REST API
FastAPI application entry point, middleware configuration, and router registration.
"""

from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware

from backend.app.core.config import settings
from backend.app.routers.auth import router as auth_router
from backend.app.routers.users import router as users_router
from backend.app.routers.applications import router as applications_router

app = FastAPI(
    title="ForgeCloud Control Plane",
    description="Self-Service Cloud-Native Internal Developer Platform REST API",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth_router, prefix="/api/auth")
app.include_router(users_router, prefix="/api/users")
app.include_router(applications_router, prefix="/api/applications")



@app.get(
    "/api/health",
    tags=["Health"],
    summary="Platform health status",
    status_code=status.HTTP_200_OK,
)
def health_check() -> dict:
    """Returns basic system health status."""
    return {
        "status": "healthy",
        "service": "forgecloud-control-plane",
        "environment": settings.ENVIRONMENT,
        "local_mode": settings.FORGECLOUD_LOCAL_MODE,
    }


@app.get(
    "/",
    tags=["Root"],
    summary="API Root Information",
    status_code=status.HTTP_200_OK,
)
def root() -> dict:
    """Returns platform identification metadata."""
    return {
        "platform": "ForgeCloud",
        "version": "0.1.0",
        "status": "online",
        "docs": "/docs",
    }
