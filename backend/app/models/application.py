"""
Application ORM Model
Represents software services managed and deployed through ForgeCloud.
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, CheckConstraint, Uuid
from sqlalchemy.orm import relationship
from backend.app.core.database import Base


class Application(Base):
    """
    Application entity representing a developer service registered in ForgeCloud.
    """
    __tablename__ = "applications"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), unique=True, nullable=False, index=True)
    repository_url = Column(String(512), nullable=False)
    branch = Column(String(100), nullable=False, default="main")
    port = Column(Integer, nullable=False, default=8000)
    runtime = Column(String(50), nullable=False, default="dockerfile")
    created_by = Column(Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    __table_args__ = (
        CheckConstraint("runtime IN ('python', 'nodejs', 'golang', 'dockerfile')", name="ck_applications_runtime"),
        CheckConstraint("port > 0 AND port <= 65535", name="ck_applications_port"),
    )

    # Relationships
    creator = relationship("User", back_populates="applications")
    deployments = relationship("Deployment", back_populates="application", cascade="all, delete-orphan")
    infrastructure = relationship("Infrastructure", back_populates="application", uselist=False, cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Application id={self.id} name={self.name} runtime={self.runtime}>"
