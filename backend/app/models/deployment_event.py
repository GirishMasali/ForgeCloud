"""
DeploymentEvent ORM Model
Represents high-resolution deployment lifecycle events and log messages.
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, CheckConstraint, Uuid
from sqlalchemy.orm import relationship
from backend.app.core.database import Base


class DeploymentEvent(Base):
    """
    DeploymentEvent entity capturing granular progression events during application deployments.
    """
    __tablename__ = "deployment_events"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    deployment_id = Column(Uuid(as_uuid=True), ForeignKey("deployments.id", ondelete="CASCADE"), nullable=False, index=True)
    event_type = Column(String(50), nullable=False, default="INFO")
    message = Column(Text, nullable=False)
    timestamp = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False, index=True)

    __table_args__ = (
        CheckConstraint(
            "event_type IN ('INFO', 'WARNING', 'ERROR', 'PROGRESS')",
            name="ck_deployment_events_type",
        ),
    )

    # Relationships
    deployment = relationship("Deployment", back_populates="events")

    def __repr__(self) -> str:
        return f"<DeploymentEvent id={self.id} deployment_id={self.deployment_id} type={self.event_type}>"
