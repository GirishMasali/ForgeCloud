"""
ForgeCloud Authentication Router
Implements login and registration endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.schemas.auth import LoginRequest, Token
from backend.app.schemas.user import UserCreate, UserResponse
from backend.app.services.auth_service import auth_service

router = APIRouter(tags=["Authentication"])


@router.post(
    "/login",
    response_model=Token,
    summary="Authenticate user and issue JWT access token",
    status_code=status.HTTP_200_OK,
)
def login(
    credentials: LoginRequest,
    db: Session = Depends(get_db),
) -> Token:
    """
    Validates user credentials and returns a signed JWT access token with user details.
    """
    user = auth_service.authenticate_user(
        db=db,
        email=credentials.email,
        password=credentials.password,
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return auth_service.create_user_token(user)


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new platform user",
)
def register(
    user_in: UserCreate,
    db: Session = Depends(get_db),
) -> UserResponse:
    """
    Creates a new user identity with a hashed password.
    Enforces unique email and valid RBAC role ('ADMIN', 'DEVELOPER', 'VIEWER').
    """
    try:
        new_user = auth_service.register_user(db=db, user_in=user_in)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

    return UserResponse.model_validate(new_user)
