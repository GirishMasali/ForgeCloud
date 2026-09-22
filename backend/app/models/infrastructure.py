"""
Infrastructure ORM Model
Represents provisioned cloud infrastructure resources associated with an application.
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, CheckConstraint, Uuid
from sqlalchemy.orm import relationship
from backend.app.core.database import Base


class Infrastructure(Base):
    """
    Infrastructure entity tracking Terraform workspaces, EKS clusters, and AWS provisioning status.
    """
    __tablename__ = "infrastructure"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    application_id = Column(Uuid(as_uuid=True), ForeignKey("applications.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    terraform_workspace = Column(String(100), nullable=False, default="default")
    region = Column(String(50), nullable=False, default="us-east-1")
    cluster_name = Column(String(100), nullable=False, default="forgecloud-dev-eks")
    status = Column(String(50), nullable=False, default="PENDING")
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    __table_args__ = (
        CheckConstraint(
            "status IN ('PROVISIONED', 'PENDING', 'FAILED', 'DESTROYED')",
            name="ck_infrastructure_status",
        ),
    )

    # Relationships (1:1 with Application)
    application = relationship("Application", back_populates="infrastructure")

    def __repr__(self) -> str:
        return f"<Infrastructure id={self.id} app_id={self.application_id} status={self.status}>"
