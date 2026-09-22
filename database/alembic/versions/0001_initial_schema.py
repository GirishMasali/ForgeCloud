"""Initial database schema for ForgeCloud 6 core entities

Revision ID: 0001_initial_schema
Revises: 
Create Date: 2026-09-22 18:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "0001_initial_schema"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. users table
    op.create_table(
        "users",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("role", sa.String(length=50), nullable=False, server_default="DEVELOPER"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint("role IN ('ADMIN', 'DEVELOPER', 'VIEWER')", name="ck_users_role"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    # 2. applications table
    op.create_table(
        "applications",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("repository_url", sa.String(length=512), nullable=False),
        sa.Column("branch", sa.String(length=100), nullable=False, server_default="main"),
        sa.Column("port", sa.Integer(), nullable=False, server_default="8000"),
        sa.Column("runtime", sa.String(length=50), nullable=False, server_default="dockerfile"),
        sa.Column("created_by", sa.Uuid(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint("runtime IN ('python', 'nodejs', 'golang', 'dockerfile')", name="ck_applications_runtime"),
        sa.CheckConstraint("port > 0 AND port <= 65535", name="ck_applications_port"),
        sa.ForeignKeyConstraint(["created_by"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
    )
    op.create_index("ix_applications_name", "applications", ["name"], unique=True)
    op.create_index("ix_applications_created_by", "applications", ["created_by"])

    # 3. deployments table
    op.create_table(
        "deployments",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("application_id", sa.Uuid(), nullable=False),
        sa.Column("version", sa.String(length=100), nullable=False),
        sa.Column("image", sa.String(length=512), nullable=False),
        sa.Column("status", sa.String(length=50), nullable=False, server_default="PENDING"),
        sa.Column("environment", sa.String(length=50), nullable=False, server_default="dev"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint(
            "status IN ('PENDING', 'BUILDING', 'DEPLOYING', 'RUNNING', 'FAILED', 'ROLLED_BACK')",
            name="ck_deployments_status",
        ),
        sa.CheckConstraint("environment IN ('dev', 'staging', 'prod')", name="ck_deployments_environment"),
        sa.ForeignKeyConstraint(["application_id"], ["applications.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_deployments_application_id", "deployments", ["application_id"])

    # 4. infrastructure table
    op.create_table(
        "infrastructure",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("application_id", sa.Uuid(), nullable=False),
        sa.Column("terraform_workspace", sa.String(length=100), nullable=False, server_default="default"),
        sa.Column("region", sa.String(length=50), nullable=False, server_default="us-east-1"),
        sa.Column("cluster_name", sa.String(length=100), nullable=False, server_default="forgecloud-dev-eks"),
        sa.Column("status", sa.String(length=50), nullable=False, server_default="PENDING"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint(
            "status IN ('PROVISIONED', 'PENDING', 'FAILED', 'DESTROYED')",
            name="ck_infrastructure_status",
        ),
        sa.ForeignKeyConstraint(["application_id"], ["applications.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("application_id"),
    )
    op.create_index("ix_infrastructure_application_id", "infrastructure", ["application_id"], unique=True)

    # 5. deployment_events table
    op.create_table(
        "deployment_events",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("deployment_id", sa.Uuid(), nullable=False),
        sa.Column("event_type", sa.String(length=50), nullable=False, server_default="INFO"),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("timestamp", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint(
            "event_type IN ('INFO', 'WARNING', 'ERROR', 'PROGRESS')",
            name="ck_deployment_events_type",
        ),
        sa.ForeignKeyConstraint(["deployment_id"], ["deployments.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_deployment_events_deployment_id", "deployment_events", ["deployment_id"])
    op.create_index("ix_deployment_events_timestamp", "deployment_events", ["timestamp"])

    # 6. audit_logs table
    op.create_table(
        "audit_logs",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=True),
        sa.Column("action", sa.String(length=50), nullable=False),
        sa.Column("resource", sa.String(length=50), nullable=False),
        sa.Column("resource_id", sa.String(length=255), nullable=True),
        sa.Column("details", sa.JSON(), nullable=True),
        sa.Column("timestamp", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint(
            "action IN ('CREATE', 'UPDATE', 'DELETE', 'DEPLOY', 'ROLLBACK')",
            name="ck_audit_logs_action",
        ),
        sa.CheckConstraint(
            "resource IN ('USER', 'APPLICATION', 'DEPLOYMENT', 'INFRASTRUCTURE')",
            name="ck_audit_logs_resource",
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_audit_logs_user_id", "audit_logs", ["user_id"])
    op.create_index("ix_audit_logs_timestamp", "audit_logs", ["timestamp"])


def downgrade() -> None:
    # Drop tables in reverse order of dependencies
    op.drop_index("ix_audit_logs_timestamp", table_name="audit_logs")
    op.drop_index("ix_audit_logs_user_id", table_name="audit_logs")
    op.drop_table("audit_logs")

    op.drop_index("ix_deployment_events_timestamp", table_name="deployment_events")
    op.drop_index("ix_deployment_events_deployment_id", table_name="deployment_events")
    op.drop_table("deployment_events")

    op.drop_index("ix_infrastructure_application_id", table_name="infrastructure")
    op.drop_table("infrastructure")

    op.drop_index("ix_deployments_application_id", table_name="deployments")
    op.drop_table("deployments")

    op.drop_index("ix_applications_created_by", table_name="applications")
    op.drop_index("ix_applications_name", table_name="applications")
    op.drop_table("applications")

    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")
