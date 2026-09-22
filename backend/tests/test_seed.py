"""
Tests for ForgeCloud Seed Utility
Verifies seed_database creates default records and is idempotent.
"""

from database.seed_data import seed_database
from backend.app.models import User, Application, Infrastructure, Deployment, DeploymentEvent, AuditLog


def test_seed_database_execution_and_idempotency(db_session):
    """Verify seed_database creates all required entities and can run repeatedly without duplicates."""
    # First execution
    result = seed_database(db_session)

    assert result["admin_user"].email == "admin@forgecloud.internal"
    assert result["admin_user"].role == "ADMIN"
    assert result["dev_user"].email == "developer@forgecloud.internal"
    assert result["dev_user"].role == "DEVELOPER"
    assert result["sample_app"].name == "sample-backend-service"
    assert result["infrastructure"].application_id == result["sample_app"].id
    assert result["deployment"].application_id == result["sample_app"].id
    assert result["audit"].action == "CREATE"

    # Verify counts in db
    assert db_session.query(User).count() == 2
    assert db_session.query(Application).count() == 1
    assert db_session.query(Infrastructure).count() == 1
    assert db_session.query(Deployment).count() == 1
    assert db_session.query(DeploymentEvent).count() == 1
    assert db_session.query(AuditLog).count() == 1

    # Second execution (must be idempotent and not create duplicate records)
    result_second = seed_database(db_session)
    assert db_session.query(User).count() == 2
    assert db_session.query(Application).count() == 1
    assert db_session.query(Infrastructure).count() == 1
    assert db_session.query(Deployment).count() == 1
