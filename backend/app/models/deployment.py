"""
Deployment ORM Model
Represents immutable release deployments for applications.
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, CheckConstraint, Uuid
from sqlalchemy.orm import relationship
from backend.app.core.database import Base


class Deployment(Base):
    """
    Deployment entity representing an application build, release, or rollback event.
    """
    __tablename__ = "deployments"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    application_id = Column(Uuid(as_uuid=True), ForeignKey("applications.id", ondelete="CASCADE"), nullable=False, index=True)
    version = Column(String(100), nullable=False)
    image = Column(String(512), nullable=False)
    status = Column(String(50), nullable=False, default="PENDING")
    environment = Column(String(50), nullable=False, default="dev")
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    __table_args__ = (
        CheckConstraint(
            "status IN ('PENDING', 'BUILDING', 'DEPLOYING', 'RUNNING', 'FAILED', 'ROLLED_BACK')",
            name="ck_deployments_status",
        ),
        CheckConstraint(
            "environment IN ('dev', 'staging', 'prod')",
            name="ck_deployments_environment",
        ),
    )

    # Relationships
    application = relationship("Application", back_populates="deployments")
    events = relationship("DeploymentEvent", back_populates="deployment", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Deployment id={self.id} app_id={self.application_id} version={self.version} status={self.status}>"
