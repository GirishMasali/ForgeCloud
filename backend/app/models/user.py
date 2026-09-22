"""
User ORM Model
Represents platform user identities and RBAC roles.
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, CheckConstraint, Uuid
from sqlalchemy.orm import relationship
from backend.app.core.database import Base


class User(Base):
    """
    User entity representing developers and administrators of ForgeCloud.
    """
    __tablename__ = "users"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="DEVELOPER")
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    __table_args__ = (
        CheckConstraint("role IN ('ADMIN', 'DEVELOPER', 'VIEWER')", name="ck_users_role"),
    )

    # Relationships
    applications = relationship("Application", back_populates="creator", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="user")

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email} role={self.role}>"
