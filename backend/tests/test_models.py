"""
Unit Tests for ForgeCloud SQLAlchemy 2.0 ORM Models
Validates entities, check constraints, foreign keys, relationships, and cascades.
"""

import uuid
import pytest
from sqlalchemy.exc import IntegrityError
from backend.app.models import (
    User,
    Application,
    Deployment,
    Infrastructure,
    DeploymentEvent,
    AuditLog,
)


class TestUserModel:
    """Tests for User model."""

    def test_create_user_success(self, db_session):
        user = User(
            name="Alice Engineer",
            email="alice@forgecloud.internal",
            password_hash="hashed_pw_secret",
            role="DEVELOPER",
        )
        db_session.add(user)
        db_session.commit()

        assert user.id is not None
        assert isinstance(user.id, uuid.UUID)
        assert user.created_at is not None
        assert user.updated_at is not None
        assert user.role == "DEVELOPER"

    def test_user_email_unique_constraint(self, db_session):
        user1 = User(
            name="User One",
            email="unique@forgecloud.internal",
            password_hash="pw1",
            role="DEVELOPER",
        )
        db_session.add(user1)
        db_session.commit()

        user2 = User(
            name="User Two",
            email="unique@forgecloud.internal",
            password_hash="pw2",
            role="DEVELOPER",
        )
        db_session.add(user2)
        with pytest.raises(IntegrityError):
            db_session.commit()
        db_session.rollback()

    def test_user_invalid_role_constraint(self, db_session):
        user = User(
            name="Invalid Role User",
            email="badrole@forgecloud.internal",
            password_hash="pw",
            role="SUPERUSER",  # Invalid role
        )
        db_session.add(user)
        with pytest.raises(IntegrityError):
            db_session.commit()
        db_session.rollback()


class TestApplicationModel:
    """Tests for Application model."""

    def test_create_application_success(self, db_session):
        user = User(
            name="Bob Lead",
            email="bob@forgecloud.internal",
            password_hash="pw",
            role="DEVELOPER",
        )
        db_session.add(user)
        db_session.commit()

        app = Application(
            name="api-gateway",
            repository_url="https://github.com/forgecloud/api-gateway.git",
            branch="main",
            port=8000,
            runtime="python",
            created_by=user.id,
        )
        db_session.add(app)
        db_session.commit()

        assert app.id is not None
        assert app.name == "api-gateway"
        assert app.creator.email == "bob@forgecloud.internal"
        assert app in user.applications

    def test_application_name_unique_constraint(self, db_session):
        user = User(
            name="Charlie",
            email="charlie@forgecloud.internal",
            password_hash="pw",
            role="DEVELOPER",
        )
        db_session.add(user)
        db_session.commit()

        app1 = Application(
            name="duplicate-app",
            repository_url="https://github.com/app1",
            created_by=user.id,
        )
        db_session.add(app1)
        db_session.commit()

        app2 = Application(
            name="duplicate-app",
            repository_url="https://github.com/app2",
            created_by=user.id,
        )
        db_session.add(app2)
        with pytest.raises(IntegrityError):
            db_session.commit()
        db_session.rollback()

    def test_application_invalid_runtime_constraint(self, db_session):
        user = User(
            name="Dave",
            email="dave@forgecloud.internal",
            password_hash="pw",
            role="DEVELOPER",
        )
        db_session.add(user)
        db_session.commit()

        app = Application(
            name="rust-app",
            repository_url="https://github.com/app",
            runtime="rust",  # Not in python, nodejs, golang, dockerfile
            created_by=user.id,
        )
        db_session.add(app)
        with pytest.raises(IntegrityError):
            db_session.commit()
        db_session.rollback()

    def test_application_invalid_port_constraint(self, db_session):
        user = User(
            name="Eve",
            email="eve@forgecloud.internal",
            password_hash="pw",
            role="DEVELOPER",
        )
        db_session.add(user)
        db_session.commit()

        app = Application(
            name="badport-app",
            repository_url="https://github.com/app",
            port=99999,  # Port must be <= 65535
            created_by=user.id,
        )
        db_session.add(app)
        with pytest.raises(IntegrityError):
            db_session.commit()
        db_session.rollback()


class TestDeploymentModel:
    """Tests for Deployment and DeploymentEvent models."""

    def test_create_deployment_and_events(self, db_session):
        user = User(name="User", email="deployer@forgecloud.internal", password_hash="pw")
        db_session.add(user)
        db_session.commit()

        app = Application(
            name="web-frontend",
            repository_url="https://github.com/forgecloud/web.git",
            runtime="nodejs",
            created_by=user.id,
        )
        db_session.add(app)
        db_session.commit()

        deployment = Deployment(
            application_id=app.id,
            version="v1.2.0",
            image="forgecloud/web-frontend:v1.2.0",
            status="BUILDING",
            environment="dev",
        )
        db_session.add(deployment)
        db_session.commit()

        event1 = DeploymentEvent(
            deployment_id=deployment.id,
            event_type="PROGRESS",
            message="Docker build started",
        )
        event2 = DeploymentEvent(
            deployment_id=deployment.id,
            event_type="INFO",
            message="Image pushed to ECR",
        )
        db_session.add_all([event1, event2])
        db_session.commit()

        assert deployment.id is not None
        assert len(deployment.events) == 2
        assert deployment.application.name == "web-frontend"

    def test_deployment_invalid_status_constraint(self, db_session):
        user = User(name="User", email="teststatus@forgecloud.internal", password_hash="pw")
        db_session.add(user)
        db_session.commit()

        app = Application(name="status-app", repository_url="https://github.com/app", created_by=user.id)
        db_session.add(app)
        db_session.commit()

        deployment = Deployment(
            application_id=app.id,
            version="v1.0",
            image="test:v1",
            status="UNKNOWN_STATUS",
        )
        db_session.add(deployment)
        with pytest.raises(IntegrityError):
            db_session.commit()
        db_session.rollback()


class TestInfrastructureModel:
    """Tests for Infrastructure 1:1 model."""

    def test_infrastructure_one_to_one_relationship(self, db_session):
        user = User(name="User", email="infrauser@forgecloud.internal", password_hash="pw")
        db_session.add(user)
        db_session.commit()

        app = Application(name="infra-app", repository_url="https://github.com/app", created_by=user.id)
        db_session.add(app)
        db_session.commit()

        infra = Infrastructure(
            application_id=app.id,
            terraform_workspace="dev",
            region="us-east-1",
            cluster_name="forgecloud-dev-eks",
            status="PROVISIONED",
        )
        db_session.add(infra)
        db_session.commit()

        assert app.infrastructure is not None
        assert app.infrastructure.cluster_name == "forgecloud-dev-eks"
        assert infra.application.name == "infra-app"

        # Test 1:1 unique constraint (cannot add second infrastructure record for same app)
        duplicate_infra = Infrastructure(
            application_id=app.id,
            terraform_workspace="prod",
            status="PENDING",
        )
        db_session.add(duplicate_infra)
        with pytest.raises(IntegrityError):
            db_session.commit()
        db_session.rollback()


class TestAuditLogModel:
    """Tests for AuditLog model."""

    def test_create_audit_log(self, db_session):
        user = User(name="Auditor", email="audit@forgecloud.internal", password_hash="pw", role="ADMIN")
        db_session.add(user)
        db_session.commit()

        audit = AuditLog(
            user_id=user.id,
            action="DEPLOY",
            resource="APPLICATION",
            resource_id="sample-app-id",
            details={"version": "v1.0.0", "env": "prod"},
        )
        db_session.add(audit)
        db_session.commit()

        assert audit.id is not None
        assert audit.details["version"] == "v1.0.0"
        assert audit.user.email == "audit@forgecloud.internal"

    def test_audit_invalid_action_constraint(self, db_session):
        audit = AuditLog(
            action="DESTROY_ALL",  # Invalid action
            resource="APPLICATION",
        )
        db_session.add(audit)
        with pytest.raises(IntegrityError):
            db_session.commit()
        db_session.rollback()


class TestCascadeDeletes:
    """Tests cascade deletion behavior."""

    def test_application_cascade_deletes_deployments_and_infra(self, db_session):
        user = User(name="User", email="cascade@forgecloud.internal", password_hash="pw")
        db_session.add(user)
        db_session.commit()

        app = Application(name="cascade-app", repository_url="https://github.com/app", created_by=user.id)
        db_session.add(app)
        db_session.commit()

        infra = Infrastructure(application_id=app.id, status="PROVISIONED")
        deploy = Deployment(application_id=app.id, version="v1", image="img:v1", status="RUNNING")
        db_session.add_all([infra, deploy])
        db_session.commit()

        event = DeploymentEvent(deployment_id=deploy.id, message="Test event")
        db_session.add(event)
        db_session.commit()

        # Delete the application
        db_session.delete(app)
        db_session.commit()

        # Verify deployments, infra, and events were cascade deleted
        assert db_session.query(Infrastructure).filter_by(id=infra.id).first() is None
        assert db_session.query(Deployment).filter_by(id=deploy.id).first() is None
        assert db_session.query(DeploymentEvent).filter_by(id=event.id).first() is None
