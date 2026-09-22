"""
ForgeCloud Database Seed Utility
Seeds initial development data: default users, sample applications, and infrastructure records.
"""

import sys
import os
import uuid

# Ensure project root is in sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.abspath(os.path.join(current_dir, ".."))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from sqlalchemy.orm import Session
from backend.app.core.database import SessionLocal
from backend.app.models import (
    User,
    Application,
    Deployment,
    Infrastructure,
    DeploymentEvent,
    AuditLog,
)


def seed_database(db: Session) -> dict:
    """
    Populates database with initial seed records if empty.
    Returns a dictionary of created entities.
    """
    # 1. Seed Users (Admin & Developer)
    admin_user = db.query(User).filter_by(email="admin@forgecloud.internal").first()
    if not admin_user:
        admin_user = User(
            name="Platform Admin",
            email="admin@forgecloud.internal",
            # Development placeholder hash for initial setup
            password_hash="$2b$12$e8i/u7i58tN6z89c2Y5j2e.wU74d00z1O8g8W7u7V6p6v5p5q4q4q",
            role="ADMIN",
        )
        db.add(admin_user)

    dev_user = db.query(User).filter_by(email="developer@forgecloud.internal").first()
    if not dev_user:
        dev_user = User(
            name="ForgeCloud Developer",
            email="developer@forgecloud.internal",
            password_hash="$2b$12$e8i/u7i58tN6z89c2Y5j2e.wU74d00z1O8g8W7u7V6p6v5p5q4q4q",
            role="DEVELOPER",
        )
        db.add(dev_user)

    db.flush()

    # 2. Seed Sample Application
    sample_app = db.query(Application).filter_by(name="sample-backend-service").first()
    if not sample_app:
        sample_app = Application(
            name="sample-backend-service",
            repository_url="https://github.com/forgecloud/sample-backend-service.git",
            branch="main",
            port=8080,
            runtime="python",
            created_by=dev_user.id,
        )
        db.add(sample_app)
        db.flush()

    # 3. Seed Infrastructure for Sample Application (1:1)
    infra = db.query(Infrastructure).filter_by(application_id=sample_app.id).first()
    if not infra:
        infra = Infrastructure(
            application_id=sample_app.id,
            terraform_workspace="dev",
            region="us-east-1",
            cluster_name="forgecloud-dev-eks",
            status="PROVISIONED",
        )
        db.add(infra)

    # 4. Seed Initial Deployment
    deployment = db.query(Deployment).filter_by(application_id=sample_app.id).first()
    if not deployment:
        deployment = Deployment(
            application_id=sample_app.id,
            version="v1.0.0",
            image="000000000000.dkr.ecr.us-east-1.amazonaws.com/sample-backend-service:v1.0.0",
            status="RUNNING",
            environment="dev",
        )
        db.add(deployment)
        db.flush()

        # 5. Seed Deployment Event
        event = DeploymentEvent(
            deployment_id=deployment.id,
            event_type="INFO",
            message="Sample application release v1.0.0 initialized successfully.",
        )
        db.add(event)

    # 6. Seed Initial Audit Log
    audit = db.query(AuditLog).filter_by(action="CREATE", resource="APPLICATION").first()
    if not audit:
        audit = AuditLog(
            user_id=admin_user.id,
            action="CREATE",
            resource="APPLICATION",
            resource_id=str(sample_app.id),
            details={"name": sample_app.name, "environment": "dev"},
        )
        db.add(audit)

    db.commit()

    return {
        "admin_user": admin_user,
        "dev_user": dev_user,
        "sample_app": sample_app,
        "infrastructure": infra,
        "deployment": deployment,
        "audit": audit,
    }


if __name__ == "__main__":
    db = SessionLocal()
    try:
        results = seed_database(db)
        print("Database seeded successfully with initial development records:")
        for key, entity in results.items():
            print(f"  - {key}: {entity}")
    finally:
        db.close()
