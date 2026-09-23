"""
Phase 4 Application Management API Test Suite
Validates authentication, RBAC, CRUD operations, Pydantic validations,
database constraints, resource errors, and identity attribution for /api/applications.
"""

import uuid
from typing import Dict
import pytest
from fastapi.testclient import TestClient

from backend.app.core.database import get_db
from backend.app.main import app
from backend.app.models.user import User
from backend.app.schemas.user import UserCreate
from backend.app.services.auth_service import auth_service


@pytest.fixture(scope="function")
def client(db_session):
    """Provides a TestClient with database session overridden to the test transaction."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def test_users(db_session) -> Dict[str, User]:
    """Seeds test users for all 3 RBAC roles."""
    admin = auth_service.register_user(
        db=db_session,
        user_in=UserCreate(
            name="Admin User",
            email="admin_app_test@test.internal",
            password="AdminPassword123!",
            role="ADMIN",
        ),
    )
    developer = auth_service.register_user(
        db=db_session,
        user_in=UserCreate(
            name="Developer User",
            email="dev_app_test@test.internal",
            password="DevPassword123!",
            role="DEVELOPER",
        ),
    )
    viewer = auth_service.register_user(
        db=db_session,
        user_in=UserCreate(
            name="Viewer User",
            email="viewer_app_test@test.internal",
            password="ViewerPassword123!",
            role="VIEWER",
        ),
    )
    return {
        "admin": admin,
        "developer": developer,
        "viewer": viewer,
    }


@pytest.fixture(scope="function")
def auth_headers(test_users) -> Dict[str, Dict[str, str]]:
    """Generates Authorization Bearer headers for each seeded role."""
    headers = {}
    for role_name, user in test_users.items():
        token_obj = auth_service.create_user_token(user)
        headers[role_name] = {"Authorization": f"Bearer {token_obj.access_token}"}
    return headers


# ==============================================================================
# 1. Authentication Tests (401 Unauthorized)
# ==============================================================================

class TestApplicationAuthentication:
    """Verifies that all application endpoints reject unauthenticated requests."""

    def test_unauthenticated_list_applications(self, client):
        resp = client.get("/api/applications")
        assert resp.status_code == 401
        assert "Authorization" in resp.json().get("detail", "")

    def test_unauthenticated_create_application(self, client):
        payload = {
            "name": "unauth-app",
            "repository_url": "https://github.com/example/unauth-app",
            "branch": "main",
            "port": 8080,
            "runtime": "python",
        }
        resp = client.post("/api/applications", json=payload)
        assert resp.status_code == 401

    def test_unauthenticated_get_application(self, client):
        dummy_id = uuid.uuid4()
        resp = client.get(f"/api/applications/{dummy_id}")
        assert resp.status_code == 401

    def test_unauthenticated_update_application(self, client):
        dummy_id = uuid.uuid4()
        resp = client.put(f"/api/applications/{dummy_id}", json={"branch": "develop"})
        assert resp.status_code == 401

    def test_unauthenticated_delete_application(self, client):
        dummy_id = uuid.uuid4()
        resp = client.delete(f"/api/applications/{dummy_id}")
        assert resp.status_code == 401


# ==============================================================================
# 2. RBAC Authorization Tests (ADMIN, DEVELOPER, VIEWER)
# ==============================================================================

class TestApplicationRBAC:
    """Verifies role permissions: ADMIN and DEVELOPER have full CRUD; VIEWER is read-only."""

    def test_admin_full_crud_access(self, client, auth_headers):
        # 1. Admin creates application
        create_payload = {
            "name": "admin-managed-service",
            "repository_url": "https://github.com/forgecloud/admin-service",
            "branch": "main",
            "port": 5000,
            "runtime": "python",
        }
        res_create = client.post("/api/applications", json=create_payload, headers=auth_headers["admin"])
        assert res_create.status_code == 201
        app_id = res_create.json()["id"]

        # 2. Admin retrieves application
        res_get = client.get(f"/api/applications/{app_id}", headers=auth_headers["admin"])
        assert res_get.status_code == 200

        # 3. Admin updates application
        res_update = client.put(
            f"/api/applications/{app_id}",
            json={"branch": "release-v1"},
            headers=auth_headers["admin"],
        )
        assert res_update.status_code == 200
        assert res_update.json()["branch"] == "release-v1"

        # 4. Admin deletes application
        res_delete = client.delete(f"/api/applications/{app_id}", headers=auth_headers["admin"])
        assert res_delete.status_code == 204

    def test_developer_full_crud_access(self, client, auth_headers):
        # 1. Developer creates application
        create_payload = {
            "name": "developer-microservice",
            "repository_url": "https://github.com/forgecloud/dev-service",
            "branch": "main",
            "port": 3000,
            "runtime": "nodejs",
        }
        res_create = client.post("/api/applications", json=create_payload, headers=auth_headers["developer"])
        assert res_create.status_code == 201
        app_id = res_create.json()["id"]

        # 2. Developer lists applications
        res_list = client.get("/api/applications", headers=auth_headers["developer"])
        assert res_list.status_code == 200
        assert any(a["id"] == app_id for a in res_list.json())

        # 3. Developer updates application
        res_update = client.put(
            f"/api/applications/{app_id}",
            json={"port": 3001},
            headers=auth_headers["developer"],
        )
        assert res_update.status_code == 200
        assert res_update.json()["port"] == 3001

        # 4. Developer deletes application
        res_delete = client.delete(f"/api/applications/{app_id}", headers=auth_headers["developer"])
        assert res_delete.status_code == 204

    def test_viewer_read_only_access(self, client, auth_headers):
        # Create an app as admin first
        create_payload = {
            "name": "viewer-target-app",
            "repository_url": "https://github.com/forgecloud/viewer-app",
            "branch": "main",
            "port": 8000,
            "runtime": "golang",
        }
        res_create = client.post("/api/applications", json=create_payload, headers=auth_headers["admin"])
        assert res_create.status_code == 201
        app_id = res_create.json()["id"]

        # 1. Viewer CAN list applications
        res_list = client.get("/api/applications", headers=auth_headers["viewer"])
        assert res_list.status_code == 200
        assert any(a["id"] == app_id for a in res_list.json())

        # 2. Viewer CAN get single application
        res_get = client.get(f"/api/applications/{app_id}", headers=auth_headers["viewer"])
        assert res_get.status_code == 200
        assert res_get.json()["name"] == "viewer-target-app"

        # 3. Viewer CANNOT create applications -> 403 Forbidden
        res_viewer_create = client.post(
            "/api/applications",
            json={"name": "viewer-forbidden", "repository_url": "https://github.com/forbidden", "port": 8080},
            headers=auth_headers["viewer"],
        )
        assert res_viewer_create.status_code == 403

        # 4. Viewer CANNOT update applications -> 403 Forbidden
        res_viewer_update = client.put(
            f"/api/applications/{app_id}",
            json={"branch": "hacked"},
            headers=auth_headers["viewer"],
        )
        assert res_viewer_update.status_code == 403

        # 5. Viewer CANNOT delete applications -> 403 Forbidden
        res_viewer_delete = client.delete(
            f"/api/applications/{app_id}",
            headers=auth_headers["viewer"],
        )
        assert res_viewer_delete.status_code == 403


# ==============================================================================
# 3. CRUD Functionality Tests
# ==============================================================================

class TestApplicationCRUD:
    """Verifies end-to-end CRUD operations, pagination, and timestamps."""

    def test_create_and_retrieve_application(self, client, auth_headers):
        payload = {
            "name": "orders-service",
            "repository_url": "https://github.com/forgecloud/orders-service.git",
            "branch": "staging",
            "port": 8080,
            "runtime": "python",
        }
        res = client.post("/api/applications", json=payload, headers=auth_headers["developer"])
        assert res.status_code == 201
        data = res.json()
        assert data["name"] == "orders-service"
        assert data["repository_url"] == "https://github.com/forgecloud/orders-service.git"
        assert data["branch"] == "staging"
        assert data["port"] == 8080
        assert data["runtime"] == "python"
        assert "id" in data
        assert "created_at" in data
        assert "updated_at" in data

        app_id = data["id"]
        # Retrieve by ID
        res_get = client.get(f"/api/applications/{app_id}", headers=auth_headers["developer"])
        assert res_get.status_code == 200
        assert res_get.json()["id"] == app_id

    def test_list_applications_pagination(self, client, auth_headers):
        # Create multiple apps
        for i in range(5):
            client.post(
                "/api/applications",
                json={
                    "name": f"page-app-{i}",
                    "repository_url": f"https://github.com/test/page-app-{i}",
                    "port": 8000 + i,
                    "runtime": "dockerfile",
                },
                headers=auth_headers["developer"],
            )

        # Pagination: limit 2
        res_p1 = client.get("/api/applications?skip=0&limit=2", headers=auth_headers["developer"])
        assert res_p1.status_code == 200
        assert len(res_p1.json()) == 2

        # Pagination: skip 2, limit 2
        res_p2 = client.get("/api/applications?skip=2&limit=2", headers=auth_headers["developer"])
        assert res_p2.status_code == 200
        assert len(res_p2.json()) == 2

        # Ensure disjoint items
        ids_p1 = {a["id"] for a in res_p1.json()}
        ids_p2 = {a["id"] for a in res_p2.json()}
        assert ids_p1.isdisjoint(ids_p2)

    def test_update_application_partial_fields(self, client, auth_headers):
        create_res = client.post(
            "/api/applications",
            json={
                "name": "update-target",
                "repository_url": "https://github.com/test/update-target",
                "port": 8000,
                "runtime": "golang",
            },
            headers=auth_headers["developer"],
        )
        app_id = create_res.json()["id"]
        created_at = create_res.json()["created_at"]

        # Update only port and branch
        update_res = client.put(
            f"/api/applications/{app_id}",
            json={"port": 9000, "branch": "prod"},
            headers=auth_headers["developer"],
        )
        assert update_res.status_code == 200
        updated = update_res.json()
        assert updated["port"] == 9000
        assert updated["branch"] == "prod"
        assert updated["name"] == "update-target"
        assert updated["runtime"] == "golang"
        assert updated["created_at"] == created_at

    def test_delete_application_lifecycle(self, client, auth_headers):
        create_res = client.post(
            "/api/applications",
            json={
                "name": "delete-lifecycle-target",
                "repository_url": "https://github.com/test/delete-target",
                "port": 4000,
                "runtime": "nodejs",
            },
            headers=auth_headers["developer"],
        )
        app_id = create_res.json()["id"]

        # Delete
        del_res = client.delete(f"/api/applications/{app_id}", headers=auth_headers["developer"])
        assert del_res.status_code == 204

        # Confirm 404
        get_res = client.get(f"/api/applications/{app_id}", headers=auth_headers["developer"])
        assert get_res.status_code == 404


# ==============================================================================
# 4. Validation & Constraint Tests
# ==============================================================================

class TestApplicationValidation:
    """Verifies request schema validation and unique constraints."""

    def test_invalid_runtime_returns_422(self, client, auth_headers):
        payload = {
            "name": "bad-runtime-app",
            "repository_url": "https://github.com/test/bad",
            "port": 8080,
            "runtime": "ruby",
        }
        res = client.post("/api/applications", json=payload, headers=auth_headers["developer"])
        assert res.status_code == 422

    def test_invalid_port_range_returns_422(self, client, auth_headers):
        # Port 0
        res1 = client.post(
            "/api/applications",
            json={"name": "zero-port", "repository_url": "https://github.com/test/bad", "port": 0, "runtime": "python"},
            headers=auth_headers["developer"],
        )
        assert res1.status_code == 422

        # Port > 65535
        res2 = client.post(
            "/api/applications",
            json={"name": "overflow-port", "repository_url": "https://github.com/test/bad", "port": 70000, "runtime": "python"},
            headers=auth_headers["developer"],
        )
        assert res2.status_code == 422

    def test_invalid_name_format_returns_422(self, client, auth_headers):
        # Leading hyphen or invalid special symbols
        res = client.post(
            "/api/applications",
            json={"name": "-invalid!name", "repository_url": "https://github.com/test/bad", "port": 8080, "runtime": "python"},
            headers=auth_headers["developer"],
        )
        assert res.status_code == 422

    def test_duplicate_name_returns_409_conflict(self, client, auth_headers):
        payload = {
            "name": "unique-service-name",
            "repository_url": "https://github.com/test/service",
            "port": 8080,
            "runtime": "python",
        }
        # First creation succeeds
        res1 = client.post("/api/applications", json=payload, headers=auth_headers["developer"])
        assert res1.status_code == 201

        # Second creation with identical name returns 409 Conflict
        res2 = client.post("/api/applications", json=payload, headers=auth_headers["developer"])
        assert res2.status_code == 409
        assert "already exists" in res2.json()["detail"]

    def test_update_duplicate_name_returns_409_conflict(self, client, auth_headers):
        # Create app A and app B
        client.post(
            "/api/applications",
            json={"name": "app-alpha", "repository_url": "https://github.com/test/a", "port": 8000, "runtime": "python"},
            headers=auth_headers["developer"],
        )
        res_b = client.post(
            "/api/applications",
            json={"name": "app-beta", "repository_url": "https://github.com/test/b", "port": 8000, "runtime": "python"},
            headers=auth_headers["developer"],
        )
        app_b_id = res_b.json()["id"]

        # Rename app B to app A name
        res_rename = client.put(
            f"/api/applications/{app_b_id}",
            json={"name": "app-alpha"},
            headers=auth_headers["developer"],
        )
        assert res_rename.status_code == 409


# ==============================================================================
# 5. Resource Errors Tests
# ==============================================================================

class TestApplicationResourceErrors:
    """Verifies proper HTTP status codes for non-existent and malformed resource IDs."""

    def test_nonexistent_application_id_returns_404(self, client, auth_headers):
        random_id = uuid.uuid4()
        res = client.get(f"/api/applications/{random_id}", headers=auth_headers["developer"])
        assert res.status_code == 404
        assert "not found" in res.json()["detail"].lower()

    def test_update_nonexistent_application_returns_404(self, client, auth_headers):
        random_id = uuid.uuid4()
        res = client.put(
            f"/api/applications/{random_id}",
            json={"branch": "new-branch"},
            headers=auth_headers["developer"],
        )
        assert res.status_code == 404

    def test_delete_nonexistent_application_returns_404(self, client, auth_headers):
        random_id = uuid.uuid4()
        res = client.delete(f"/api/applications/{random_id}", headers=auth_headers["developer"])
        assert res.status_code == 404

    def test_malformed_uuid_returns_422(self, client, auth_headers):
        res = client.get("/api/applications/not-a-valid-uuid", headers=auth_headers["developer"])
        assert res.status_code == 422


# ==============================================================================
# 6. Identity Attribution Tests
# ==============================================================================

class TestApplicationIdentityAttribution:
    """Verifies created_by derivation from authenticated user and prevents client spoofing."""

    def test_created_by_is_derived_from_authenticated_user(self, client, auth_headers, test_users):
        dev_user = test_users["developer"]
        res = client.post(
            "/api/applications",
            json={
                "name": "identity-test-app",
                "repository_url": "https://github.com/forgecloud/id-test",
                "port": 8080,
                "runtime": "python",
            },
            headers=auth_headers["developer"],
        )
        assert res.status_code == 201
        assert res.json()["created_by"] == str(dev_user.id)

    def test_client_supplied_created_by_is_ignored(self, client, auth_headers, test_users):
        dev_user = test_users["developer"]
        admin_user = test_users["admin"]
        # Client tries to pass created_by = admin_user.id
        res = client.post(
            "/api/applications",
            json={
                "name": "spoof-attempt-app",
                "repository_url": "https://github.com/forgecloud/spoof",
                "port": 8080,
                "runtime": "python",
                "created_by": str(admin_user.id),
            },
            headers=auth_headers["developer"],
        )
        assert res.status_code == 201
        # Must be bound to developer, NOT the spoofed admin
        assert res.json()["created_by"] == str(dev_user.id)
        assert res.json()["created_by"] != str(admin_user.id)
