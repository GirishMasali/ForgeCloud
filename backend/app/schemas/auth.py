"""
ForgeCloud Authentication Schemas
Defines request and response models for authentication, tokens, and credentials.
"""

from typing import Optional
from pydantic import BaseModel, Field, field_validator
from backend.app.schemas.user import UserResponse, EMAIL_REGEX


class LoginRequest(BaseModel):
    """Payload submitted to authenticate and obtain a JWT access token."""
    email: str = Field(..., description="User's registered email address")
    password: str = Field(..., description="User's plaintext password")

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        cleaned = v.strip().lower()
        if not EMAIL_REGEX.match(cleaned):
            raise ValueError("Invalid email address format")
        return cleaned


class Token(BaseModel):
    """Bearer access token response with profile information."""
    access_token: str = Field(..., description="Signed JWT access token")
    token_type: str = Field("bearer", description="Token type")
    expires_in: int = Field(..., description="Token lifespan in seconds")
    user: UserResponse = Field(..., description="Authenticated user summary")


class TokenPayload(BaseModel):
    """Decoded internal representation of JWT claims."""
    sub: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None
    exp: Optional[int] = None
