"""
ForgeCloud Services Package
Exposes domain service singletons.
"""

from backend.app.services.auth_service import AuthService, auth_service
from backend.app.services.application_service import ApplicationService, application_service

__all__ = [
    "AuthService",
    "auth_service",
    "ApplicationService",
    "application_service",
]