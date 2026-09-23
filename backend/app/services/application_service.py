"""
ForgeCloud Application Service
Encapsulates domain logic for application registration, configuration management, and lifecycle queries.
"""

from datetime import datetime
from typing import List, Optional, Union
from uuid import UUID
from sqlalchemy.orm import Session

from backend.app.models.application import Application
from backend.app.schemas.application import ApplicationCreate, ApplicationUpdate


class ApplicationService:
    """Service handling application entity queries, creation, updates, and deletion."""

    @staticmethod
    def get_application_by_id(
        db: Session,
        app_id: Union[str, UUID],
    ) -> Optional[Application]:
        """Look up an application by UUID primary key."""
        if isinstance(app_id, str):
            try:
                app_id = UUID(app_id)
            except ValueError:
                return None
        return db.query(Application).filter(Application.id == app_id).first()

    @staticmethod
    def get_application_by_name(
        db: Session,
        name: str,
    ) -> Optional[Application]:
        """Look up an application by unique name."""
        cleaned_name = name.strip()
        return db.query(Application).filter(Application.name == cleaned_name).first()

    @staticmethod
    def list_applications(
        db: Session,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Application]:
        """Retrieve a list of applications ordered by creation timestamp."""
        return (
            db.query(Application)
            .order_by(Application.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    @classmethod
    def create_application(
        cls,
        db: Session,
        app_in: ApplicationCreate,
        user_id: UUID,
    ) -> Application:
        """
        Creates a new application with the authenticated user designated as creator.
        Raises ValueError if an application with the same name already exists.
        """
        existing = cls.get_application_by_name(db, app_in.name)
        if existing:
            raise ValueError(f"Application with name '{app_in.name}' already exists")

        new_app = Application(
            name=app_in.name,
            repository_url=app_in.repository_url,
            branch=app_in.branch,
            port=app_in.port,
            runtime=app_in.runtime,
            created_by=user_id,
        )
        db.add(new_app)
        db.commit()
        db.refresh(new_app)
        return new_app

    @classmethod
    def update_application(
        cls,
        db: Session,
        application: Application,
        app_in: ApplicationUpdate,
    ) -> Application:
        """
        Updates an existing application configuration.
        Raises ValueError if the updated name conflicts with another application.
        """
        if app_in.name is not None and app_in.name != application.name:
            existing = cls.get_application_by_name(db, app_in.name)
            if existing and existing.id != application.id:
                raise ValueError(f"Application with name '{app_in.name}' already exists")
            application.name = app_in.name

        if app_in.repository_url is not None:
            application.repository_url = app_in.repository_url
        if app_in.branch is not None:
            application.branch = app_in.branch
        if app_in.port is not None:
            application.port = app_in.port
        if app_in.runtime is not None:
            application.runtime = app_in.runtime

        application.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(application)
        return application

    @staticmethod
    def delete_application(
        db: Session,
        application: Application,
    ) -> None:
        """Removes an application from the database, cascading related child records."""
        db.delete(application)
        db.commit()


application_service = ApplicationService()
