"""
ForgeCloud User Pydantic Schemas
Defines request and response schemas for user data validation and serialization.
"""

import re
from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field, field_validator

EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")
ALLOWED_ROLES = {"ADMIN", "DEVELOPER", "VIEWER"}


class UserBase(BaseModel):
    """Base fields shared by user schemas."""
    email: str = Field(..., description="Unique email address of the user")
    name: str = Field(..., min_length=1, max_length=255, description="Full name of the user")

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        cleaned = v.strip().lower()
        if not EMAIL_REGEX.match(cleaned):
            raise ValueError("Invalid email address format")
        return cleaned


class UserCreate(UserBase):
    """Schema for registering a new platform user."""
    password: str = Field(..., min_length=6, max_length=128, description="User password")
    role: Optional[str] = Field("DEVELOPER", description="Assigned RBAC role")

    @field_validator("role")
    @classmethod
    def validate_role(cls, v: Optional[str]) -> str:
        if v is None:
            return "DEVELOPER"
        upper_role = v.strip().upper()
        if upper_role not in ALLOWED_ROLES:
            raise ValueError(f"Role must be one of: {', '.join(sorted(ALLOWED_ROLES))}")
        return upper_role


class UserResponse(BaseModel):
    """Public user profile response schema."""
    id: UUID
    name: str
    email: str
    role: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
