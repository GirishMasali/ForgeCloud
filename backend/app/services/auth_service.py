"""
ForgeCloud Authentication Service
Encapsulates domain logic for user authentication, registration, and identity resolution.
"""

from typing import Optional, Union
from uuid import UUID
from sqlalchemy.orm import Session

from backend.app.core.config import settings
from backend.app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
)
from backend.app.models.user import User
from backend.app.schemas.auth import Token
from backend.app.schemas.user import UserCreate, UserResponse


class AuthService:
    """Service handling credential verification, user registration, and token generation."""

    @staticmethod
    def get_user_by_id(db: Session, user_id: Union[str, UUID]) -> Optional[User]:
        """Look up user record by UUID."""
        if isinstance(user_id, str):
            try:
                user_id = UUID(user_id)
            except ValueError:
                return None
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def get_user_by_email(db: Session, email: str) -> Optional[User]:
        """Look up user record by email (case-insensitive lookup)."""
        normalized_email = email.strip().lower()
        return db.query(User).filter(User.email == normalized_email).first()

    @classmethod
    def authenticate_user(
        cls,
        db: Session,
        email: str,
        password: str,
    ) -> Optional[User]:
        """
        Validates user credentials against stored password hash.
        Returns User if authentication succeeds, None otherwise.
        """
        user = cls.get_user_by_email(db, email)
        if not user:
            return None
        if not verify_password(password, user.password_hash):
            return None
        return user

    @classmethod
    def register_user(
        cls,
        db: Session,
        user_in: UserCreate,
    ) -> User:
        """
        Creates a new user record with a hashed password.
        Raises ValueError if a user with the same email already exists.
        """
        existing = cls.get_user_by_email(db, user_in.email)
        if existing:
            raise ValueError(f"User with email '{user_in.email}' already exists")

        hashed_pw = hash_password(user_in.password)
        new_user = User(
            name=user_in.name,
            email=user_in.email,
            password_hash=hashed_pw,
            role=user_in.role or "DEVELOPER",
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user

    @staticmethod
    def create_user_token(user: User) -> Token:
        """
        Generates a JWT access token for an authenticated user and bundles
        it into the Token response schema.
        """
        token_claims = {
            "sub": str(user.id),
            "email": user.email,
            "role": user.role,
        }
        access_token = create_access_token(data=token_claims)
        expires_seconds = settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60

        return Token(
            access_token=access_token,
            token_type="bearer",
            expires_in=expires_seconds,
            user=UserResponse.model_validate(user),
        )


auth_service = AuthService()
