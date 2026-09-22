"""
Integration Tests for ForgeCloud Alembic Migrations
Validates upgrading to head and downgrading to base against a clean SQLite test database.
"""

import os
import tempfile
import pytest
from sqlalchemy import create_engine, inspect
from alembic.config import Config
from alembic import command


def test_alembic_upgrade_and_downgrade():
    """Verify that Alembic runs 0001_initial_schema up and down cleanly."""
    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as tmp:
        db_path = tmp.name

    try:
        sqlite_url = f"sqlite:///{db_path}"
        project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
        ini_path = os.path.join(project_root, "database", "alembic.ini")

        # Configure Alembic with custom sqlite URL
        alembic_cfg = Config(ini_path)
        alembic_cfg.set_main_option("script_location", os.path.join(project_root, "database", "alembic"))
        alembic_cfg.set_main_option("sqlalchemy.url", sqlite_url)

        # 1. Run Upgrade to Head
        command.upgrade(alembic_cfg, "head")

        # 2. Inspect created tables
        engine = create_engine(sqlite_url)
        inspector = inspect(engine)
        table_names = set(inspector.get_table_names())

        expected_tables = {
            "users",
            "applications",
            "deployments",
            "infrastructure",
            "deployment_events",
            "audit_logs",
            "alembic_version",
        }
        assert expected_tables.issubset(table_names), f"Missing tables: {expected_tables - table_names}"

        # Inspect columns for users table
        user_cols = {col["name"] for col in inspector.get_columns("users")}
        assert {"id", "name", "email", "password_hash", "role", "created_at", "updated_at"}.issubset(user_cols)

        # 3. Run Downgrade to Base
        command.downgrade(alembic_cfg, "base")

        # 4. Verify tables dropped
        inspector = inspect(engine)
        remaining_tables = set(inspector.get_table_names())
        assert remaining_tables == {"alembic_version"} or len(remaining_tables) == 0

        engine.dispose()
    finally:
        if os.path.exists(db_path):
            try:
                os.remove(db_path)
            except Exception:
                pass
