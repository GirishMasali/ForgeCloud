"""
ForgeCloud Applications Router
Implements application lifecycle REST endpoints: list, create, retrieve, update, and delete.
Enforces authentication and role-based access control (RBAC).
"""

from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.dependencies import require_developer, require_viewer
from backend.app.models.user import User
from backend.app.schemas.application import (
    ApplicationCreate,
    ApplicationResponse,
    ApplicationUpdate,
)
from backend.app.services.application_service import application_service

router = APIRouter(tags=["Applications"])


@router.get(
    "",
    response_model=List[ApplicationResponse],
    status_code=status.HTTP_200_OK,
    summary="List registered applications",
)
def list_applications(
    skip: int = Query(0, ge=0, description="Offset for pagination"),
    limit: int = Query(100, ge=1, le=500, description="Page limit"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_viewer),
) -> List[ApplicationResponse]:
    """
    Retrieves all applications registered in ForgeCloud.
    Accessible to ADMIN, DEVELOPER, and VIEWER roles.
    """
    apps = application_service.list_applications(db=db, skip=skip, limit=limit)
    return [ApplicationResponse.model_validate(app) for app in apps]


@router.post(
    "",
    response_model=ApplicationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new application",
)
def create_application(
    app_in: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_developer),
) -> ApplicationResponse:
    """
    Registers a new application in ForgeCloud.
    The created_by attribute is automatically bound to the authenticated user.
    Accessible to ADMIN and DEVELOPER roles. VIEWER receives 403 Forbidden.
    """
    try:
        new_app = application_service.create_application(
            db=db,
            app_in=app_in,
            user_id=current_user.id,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e),
        )

    return ApplicationResponse.model_validate(new_app)


@router.get(
    "/{id}",
    response_model=ApplicationResponse,
    status_code=status.HTTP_200_OK,
    summary="Retrieve application details",
)
def get_application(
    id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_viewer),
) -> ApplicationResponse:
    """
    Retrieves configuration and metadata for a specific application.
    Accessible to ADMIN, DEVELOPER, and VIEWER roles.
    """
    app = application_service.get_application_by_id(db=db, app_id=id)
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application with ID '{id}' not found",
        )

    return ApplicationResponse.model_validate(app)


@router.put(
    "/{id}",
    response_model=ApplicationResponse,
    status_code=status.HTTP_200_OK,
    summary="Update application configuration",
)
def update_application(
    id: UUID,
    app_in: ApplicationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_developer),
) -> ApplicationResponse:
    """
    Updates configuration for an existing application.
    Accessible to ADMIN and DEVELOPER roles. VIEWER receives 403 Forbidden.
    """
    app = application_service.get_application_by_id(db=db, app_id=id)
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application with ID '{id}' not found",
        )

    try:
        updated_app = application_service.update_application(
            db=db,
            application=app,
            app_in=app_in,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e),
        )

    return ApplicationResponse.model_validate(updated_app)


@router.delete(
    "/{id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete an application",
    response_class=Response,
)
def delete_application(
    id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_developer),
) -> Response:
    """
    Deletes an application and cascades removal of associated child records.
    Accessible to ADMIN and DEVELOPER roles. VIEWER receives 403 Forbidden.
    """
    app = application_service.get_application_by_id(db=db, app_id=id)
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application with ID '{id}' not found",
        )

    application_service.delete_application(db=db, application=app)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
