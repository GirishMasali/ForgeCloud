"""
ForgeCloud Application Pydantic Schemas
Defines request and response schemas for application lifecycle management and validation.
"""

import re
from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field, field_validator

from backend.app.schemas.user import UserResponse

ALLOWED_RUNTIMES = {"python", "nodejs", "golang", "dockerfile"}
APP_NAME_REGEX = re.compile(r"^[a-zA-Z0-9][a-zA-Z0-9_.-]*$")


class ApplicationBase(BaseModel):
    """Base fields shared by application schemas."""
    name: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="Unique application identifier name (slug)",
    )
    repository_url: str = Field(
        ...,
        min_length=1,
        max_length=512,
        description="Git repository URL (HTTPS or SSH)",
    )
    branch: str = Field(
        "main",
        min_length=1,
        max_length=100,
        description="Git branch name",
    )
    port: int = Field(
        8000,
        ge=1,
        le=65535,
        description="Container network port (1-65535)",
    )
    runtime: str = Field(
        "dockerfile",
        description="Application runtime environment ('python', 'nodejs', 'golang', 'dockerfile')",
    )

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        cleaned = v.strip()
        if not cleaned:
            raise ValueError("Application name cannot be empty or whitespace only")
        if not APP_NAME_REGEX.match(cleaned):
            raise ValueError(
                "Application name must begin with an alphanumeric character and contain "
                "only letters, numbers, underscores, hyphens, and periods"
            )
        return cleaned

    @field_validator("repository_url")
    @classmethod
    def validate_repository_url(cls, v: str) -> str:
        cleaned = v.strip()
        if not cleaned:
            raise ValueError("Repository URL cannot be empty")
        return cleaned

    @field_validator("branch")
    @classmethod
    def validate_branch(cls, v: str) -> str:
        cleaned = v.strip()
        if not cleaned:
            return "main"
        return cleaned

    @field_validator("runtime")
    @classmethod
    def validate_runtime(cls, v: str) -> str:
        cleaned = v.strip().lower()
        if cleaned not in ALLOWED_RUNTIMES:
            raise ValueError(
                f"Runtime '{v}' is not supported. Supported runtimes: {', '.join(sorted(ALLOWED_RUNTIMES))}"
            )
        return cleaned


class ApplicationCreate(ApplicationBase):
    """Payload for registering a new application. created_by is derived from the authenticated user."""
    pass


class ApplicationUpdate(BaseModel):
    """Payload for updating an existing application. All fields are optional."""
    name: Optional[str] = Field(
        None,
        min_length=1,
        max_length=255,
        description="New application name",
    )
    repository_url: Optional[str] = Field(
        None,
        min_length=1,
        max_length=512,
        description="New Git repository URL",
    )
    branch: Optional[str] = Field(
        None,
        min_length=1,
        max_length=100,
        description="New Git branch",
    )
    port: Optional[int] = Field(
        None,
        ge=1,
        le=65535,
        description="New container port",
    )
    runtime: Optional[str] = Field(
        None,
        description="New runtime environment",
    )

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        cleaned = v.strip()
        if not cleaned:
            raise ValueError("Application name cannot be empty or whitespace only")
        if not APP_NAME_REGEX.match(cleaned):
            raise ValueError(
                "Application name must begin with an alphanumeric character and contain "
                "only letters, numbers, underscores, hyphens, and periods"
            )
        return cleaned

    @field_validator("repository_url")
    @classmethod
    def validate_repository_url(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        cleaned = v.strip()
        if not cleaned:
            raise ValueError("Repository URL cannot be empty")
        return cleaned

    @field_validator("branch")
    @classmethod
    def validate_branch(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        cleaned = v.strip()
        if not cleaned:
            raise ValueError("Branch cannot be empty")
        return cleaned

    @field_validator("runtime")
    @classmethod
    def validate_runtime(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        cleaned = v.strip().lower()
        if cleaned not in ALLOWED_RUNTIMES:
            raise ValueError(
                f"Runtime '{v}' is not supported. Supported runtimes: {', '.join(sorted(ALLOWED_RUNTIMES))}"
            )
        return cleaned


class ApplicationResponse(BaseModel):
    """Detailed response schema for an application."""
    id: UUID
    name: str
    repository_url: str
    branch: str
    port: int
    runtime: str
    created_by: UUID
    created_at: datetime
    updated_at: datetime
    creator: Optional[UserResponse] = None

    model_config = ConfigDict(from_attributes=True)
