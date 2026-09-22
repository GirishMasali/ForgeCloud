"""
AuditLog ORM Model
Represents immutable security and administrative audit event records.
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, CheckConstraint, JSON, Uuid
from sqlalchemy.orm import relationship
from backend.app.core.database import Base


class AuditLog(Base):
    """
    AuditLog entity recording user actions, mutations, and administrative events.
    """
    __tablename__ = "audit_logs"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(Uuid(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    action = Column(String(50), nullable=False)
    resource = Column(String(50), nullable=False)
    resource_id = Column(String(255), nullable=True)
    details = Column(JSON, nullable=True)
    timestamp = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False, index=True)

    __table_args__ = (
        CheckConstraint(
            "action IN ('CREATE', 'UPDATE', 'DELETE', 'DEPLOY', 'ROLLBACK')",
            name="ck_audit_logs_action",
        ),
        CheckConstraint(
            "resource IN ('USER', 'APPLICATION', 'DEPLOYMENT', 'INFRASTRUCTURE')",
            name="ck_audit_logs_resource",
        ),
    )

    # Relationships
    user = relationship("User", back_populates="audit_logs")

    def __repr__(self) -> str:
        return f"<AuditLog id={self.id} action={self.action} resource={self.resource} timestamp={self.timestamp}>"
