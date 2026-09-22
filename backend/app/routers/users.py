"""
ForgeCloud Users Router
Implements user profile and identity resolution endpoints.
"""

from fastapi import APIRouter, Depends, status
from backend.app.dependencies import get_current_user
from backend.app.models.user import User
from backend.app.schemas.user import UserResponse

router = APIRouter(tags=["Users"])


@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Get current authenticated user profile",
)
def get_current_user_profile(
    current_user: User = Depends(get_current_user),
) -> UserResponse:
    """
    Returns the identity, role, and metadata of the currently authenticated user.
    """
    return UserResponse.model_validate(current_user)
