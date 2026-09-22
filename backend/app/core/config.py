"""
ForgeCloud Configuration Settings
Loads configuration from environment variables and .env templates.
"""

from typing import List, Union
import json

try:
    from pydantic_settings import BaseSettings, SettingsConfigDict
except ImportError:  # Fallback for environments before pydantic-settings installation
    try:
        from pydantic import BaseSettings
        SettingsConfigDict = None
    except ImportError:
        BaseSettings = object
        SettingsConfigDict = None


class Settings(BaseSettings if issubclass(BaseSettings, object) else object):
    """
    Application configuration settings loaded from environment.
    """
    # Environment & Platform Mode
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "info"
    FORGECLOUD_LOCAL_MODE: bool = True
    BACKEND_PORT: int = 8000

    # PostgreSQL Database Configuration
    DATABASE_URL: str = "postgresql://forgecloud_user:forgecloud_password@localhost:5432/forgecloud_db"
    POSTGRES_USER: str = "forgecloud_user"
    POSTGRES_PASSWORD: str = "forgecloud_password"
    POSTGRES_DB: str = "forgecloud_db"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432

    # JWT Authentication & Security
    JWT_SECRET_KEY: str = "change-this-to-a-secure-random-32-byte-hex-key-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # CORS Allowed Origins
    CORS_ORIGINS: Union[List[str], str] = ["http://localhost:5173", "http://127.0.0.1:5173"]

    # AWS Cloud Configuration (Placeholders)
    AWS_REGION: str = "us-east-1"
    AWS_DEFAULT_OUTPUT: str = "json"
    AWS_ACCOUNT_ID: str = "000000000000"
    ECR_REPOSITORY_NAME: str = "forgecloud-apps"
    EKS_CLUSTER_NAME: str = "forgecloud-dev-eks"

    # Observability Configuration
    PROMETHEUS_METRICS_PATH: str = "/metrics"
    OTEL_SERVICE_NAME: str = "forgecloud-control-plane"

    if SettingsConfigDict is not None:
        model_config = SettingsConfigDict(
            env_file=(".env", "backend/.env"),
            env_file_encoding="utf-8",
            extra="ignore",
        )
    else:
        class Config:
            env_file = ".env"
            extra = "ignore"

    def get_cors_origins(self) -> List[str]:
        """Parse CORS origins if provided as a JSON string in environment."""
        if isinstance(self.CORS_ORIGINS, str):
            try:
                return json.loads(self.CORS_ORIGINS)
            except json.JSONDecodeError:
                return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]
        return self.CORS_ORIGINS


# Singleton instance
settings = Settings()
