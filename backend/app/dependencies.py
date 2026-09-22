"""
ForgeCloud FastAPI Dependencies
Provides request-scoped database sessions, authentication resolution, and RBAC enforcement.
"""

from typing import Optional, Sequence
from fastapi import Depends, HTTPException, Request, status
from jose import ExpiredSignatureError, JWTError
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.core.security import decode_access_token
from backend.app.models.user import User
from backend.app.services.auth_service import auth_service


def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
) -> User:
    """
    Extracts the Bearer JWT token from the Authorization header, validates
    its cryptographic signature and expiration, and resolves the User record.

    Raises HTTP 401 Unauthorized on:
    - Missing Authorization header
    - Malformed Authorization header (must be 'Bearer <token>')
    - Expired JWT token
    - Invalid signature or unparseable claims
    - Unknown/deleted user identity
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )

    parts = auth_header.strip().split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Authorization header format. Expected 'Bearer <token>'",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = parts[1]

    try:
        payload = decode_access_token(token)
    except ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id: Optional[str] = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing subject claim",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = auth_service.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


class RoleChecker:
    """
    Reusable authorization guard enforcing Role-Based Access Control (RBAC).
    Checks that the authenticated user possesses one of the allowed roles.
    """

    def __init__(self, allowed_roles: Sequence[str]):
        self.allowed_roles = set(allowed_roles)

    def __call__(self, current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation not permitted. Required role: {', '.join(sorted(self.allowed_roles))}",
            )
        return current_user


def require_roles(*roles: str) -> RoleChecker:
    """Factory creating a RoleChecker dependency for the specified roles."""
    return RoleChecker(roles)


# Common pre-configured role dependencies
require_admin = RoleChecker(["ADMIN"])
require_developer = RoleChecker(["ADMIN", "DEVELOPER"])
require_viewer = RoleChecker(["ADMIN", "DEVELOPER", "VIEWER"])
