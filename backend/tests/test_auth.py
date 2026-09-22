"""
Phase 3 Authentication & RBAC Test Suite
Validates password hashing, verification, JWT token lifecycle, login, registration,
authenticated profile resolution, and Role-Based Access Control (RBAC).
"""

from datetime import timedelta
import pytest
from fastapi import APIRouter, Depends, status
from fastapi.testclient import TestClient
from jose import ExpiredSignatureError, JWTError

from backend.app.core.database import get_db
from backend.app.core.security import (
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)
from backend.app.dependencies import (
    get_current_user,
    require_admin,
    require_developer,
    require_viewer,
)
from backend.app.main import app
from backend.app.models.user import User
from backend.app.schemas.user import UserCreate
from backend.app.services.auth_service import auth_service

# Test Router for RBAC route verification
rbac_test_router = APIRouter(prefix="/api/test-rbac", tags=["Test RBAC"])


@rbac_test_router.get("/admin-only")
def admin_only_endpoint(current_user: User = Depends(require_admin)):
    return {"message": "admin access granted", "role": current_user.role}


@rbac_test_router.get("/developer-only")
def developer_only_endpoint(current_user: User = Depends(require_developer)):
    return {"message": "developer access granted", "role": current_user.role}


@rbac_test_router.get("/viewer-only")
def viewer_only_endpoint(current_user: User = Depends(require_viewer)):
    return {"message": "viewer access granted", "role": current_user.role}


# Include test RBAC routes once
if not any(getattr(r, "path", "").startswith("/api/test-rbac") for r in app.routes):
    app.include_router(rbac_test_router)


@pytest.fixture(scope="function")
def client(db_session):
    """
    Provides a FastAPI TestClient with the database dependency overridden
    to use the isolated in-memory test session.
    """
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
def seed_users(db_session):
    """
    Seeds a test set of users across all 3 roles: ADMIN, DEVELOPER, VIEWER.
    """
    admin = auth_service.register_user(
        db=db_session,
        user_in=UserCreate(
            name="Admin User",
            email="admin@test.internal",
            password="AdminPassword123!",
            role="ADMIN",
        ),
    )
    developer = auth_service.register_user(
        db=db_session,
        user_in=UserCreate(
            name="Developer User",
            email="dev@test.internal",
            password="DevPassword123!",
            role="DEVELOPER",
        ),
    )
    viewer = auth_service.register_user(
        db=db_session,
        user_in=UserCreate(
            name="Viewer User",
            email="viewer@test.internal",
            password="ViewerPassword123!",
            role="VIEWER",
        ),
    )
    return {
        "admin": admin,
        "developer": developer,
        "viewer": viewer,
    }


# ==============================================================================
# 1 & 2. Password Hashing & Verification Tests
# ==============================================================================

def test_password_hashing():
    """Verify password hashing generates unique salts and non-plaintext hashes."""
    password = "SuperSecretPassword123!"
    hash1 = hash_password(password)
    hash2 = hash_password(password)

    assert hash1 != password
    assert hash2 != password
    # Bcrypt produces different hashes for the same password due to unique salt
    assert hash1 != hash2
    assert hash1.startswith("$2")


def test_password_verification():
    """Verify password verification with correct, incorrect, and empty passwords."""
    password = "CorrectHorseBatteryStaple"
    hashed = hash_password(password)

    assert verify_password(password, hashed) is True
    assert verify_password("WrongPassword!", hashed) is False
    assert verify_password("", hashed) is False
    assert verify_password(password, "") is False


# ==============================================================================
# 3, 4, 5, 6. JWT Token Lifecycle Tests
# ==============================================================================

def test_jwt_creation():
    """Verify JWT access token generation and expected standard claims."""
    claims = {
        "sub": "user-uuid-12345",
        "email": "user@forgecloud.internal",
        "role": "DEVELOPER",
    }
    token = create_access_token(claims)
    assert isinstance(token, str)
    assert len(token) > 20
    assert token.count(".") == 2


def test_jwt_validation():
    """Verify valid JWT token decodes and yields original claims."""
    claims = {
        "sub": "user-uuid-12345",
        "email": "user@forgecloud.internal",
        "role": "DEVELOPER",
    }
    token = create_access_token(claims)
    payload = decode_access_token(token)

    assert payload["sub"] == claims["sub"]
    assert payload["email"] == claims["email"]
    assert payload["role"] == claims["role"]
    assert "exp" in payload
    assert "iat" in payload


def test_invalid_jwt():
    """Verify corrupted, tampered, or invalid JWT tokens raise JWTError."""
    valid_token = create_access_token({"sub": "test-user"})
    corrupted_token = valid_token[:-5] + "XXXXX"

    with pytest.raises(JWTError):
        decode_access_token(corrupted_token)

    with pytest.raises(JWTError):
        decode_access_token("completely-invalid-token")


def test_expired_jwt():
    """Verify tokens past their expiration timestamp raise ExpiredSignatureError."""
    token = create_access_token(
        {"sub": "expired-user"},
        expires_delta=timedelta(seconds=-1),
    )
    with pytest.raises(ExpiredSignatureError):
        decode_access_token(token)


# ==============================================================================
# 7, 8, 9. Login Endpoint Tests
# ==============================================================================

def test_login_valid_credentials(client, seed_users):
    """POST /api/auth/login with valid credentials returns 200 and access token."""
    response = client.post(
        "/api/auth/login",
        json={"email": "dev@test.internal", "password": "DevPassword123!"},
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["expires_in"] > 0
    assert data["user"]["email"] == "dev@test.internal"
    assert data["user"]["role"] == "DEVELOPER"


def test_login_invalid_password(client, seed_users):
    """POST /api/auth/login with wrong password returns 401 Unauthorized."""
    response = client.post(
        "/api/auth/login",
        json={"email": "dev@test.internal", "password": "WrongPassword123!"},
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json()["detail"] == "Invalid email or password"
    assert "WWW-Authenticate" in response.headers


def test_login_unknown_user(client, seed_users):
    """POST /api/auth/login with non-existent email returns 401 Unauthorized."""
    response = client.post(
        "/api/auth/login",
        json={"email": "nonexistent@test.internal", "password": "AnyPassword123!"},
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json()["detail"] == "Invalid email or password"


# ==============================================================================
# 10, 11, 12. Authenticated Profile (/api/users/me) & Auth Header Tests
# ==============================================================================

def test_authenticated_users_me(client, seed_users):
    """GET /api/users/me with valid Bearer token returns 200 and current profile."""
    # Obtain token
    login_resp = client.post(
        "/api/auth/login",
        json={"email": "admin@test.internal", "password": "AdminPassword123!"},
    )
    token = login_resp.json()["access_token"]

    response = client.get(
        "/api/users/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["email"] == "admin@test.internal"
    assert data["name"] == "Admin User"
    assert data["role"] == "ADMIN"
    assert "id" in data


def test_users_me_missing_auth(client):
    """GET /api/users/me with missing Authorization header returns 401."""
    response = client.get("/api/users/me")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert "Missing Authorization header" in response.json()["detail"]


def test_users_me_malformed_auth_header(client):
    """GET /api/users/me with malformed Authorization headers returns 401."""
    # 1. Missing 'Bearer ' prefix
    response1 = client.get(
        "/api/users/me",
        headers={"Authorization": "some-token-without-bearer"},
    )
    assert response1.status_code == status.HTTP_401_UNAUTHORIZED

    # 2. Non-bearer scheme (e.g. Basic)
    response2 = client.get(
        "/api/users/me",
        headers={"Authorization": "Basic dXNlcjpwYXNz"},
    )
    assert response2.status_code == status.HTTP_401_UNAUTHORIZED

    # 3. Only 'Bearer' without token
    response3 = client.get(
        "/api/users/me",
        headers={"Authorization": "Bearer"},
    )
    assert response3.status_code == status.HTTP_401_UNAUTHORIZED

    # 4. Invalid token signature
    response4 = client.get(
        "/api/users/me",
        headers={"Authorization": "Bearer invalid.signature.token"},
    )
    assert response4.status_code == status.HTTP_401_UNAUTHORIZED


def test_users_me_expired_token(client):
    """GET /api/users/me with expired token returns 401."""
    expired_token = create_access_token(
        {"sub": "any-uuid"},
        expires_delta=timedelta(seconds=-10),
    )
    response = client.get(
        "/api/users/me",
        headers={"Authorization": f"Bearer {expired_token}"},
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert "expired" in response.json()["detail"].lower()


# ==============================================================================
# 13, 14, 15, 16. RBAC & Role Enforcement Tests
# ==============================================================================

def test_admin_authorization(client, seed_users):
    """
    ADMIN role possesses full platform access:
    Must succeed on admin-only, developer-only, and viewer-only endpoints.
    """
    token = auth_service.create_user_token(seed_users["admin"]).access_token
    headers = {"Authorization": f"Bearer {token}"}

    # Admin access
    r_admin = client.get("/api/test-rbac/admin-only", headers=headers)
    assert r_admin.status_code == status.HTTP_200_OK

    # Developer access
    r_dev = client.get("/api/test-rbac/developer-only", headers=headers)
    assert r_dev.status_code == status.HTTP_200_OK

    # Viewer access
    r_viewer = client.get("/api/test-rbac/viewer-only", headers=headers)
    assert r_viewer.status_code == status.HTTP_200_OK


def test_developer_authorization(client, seed_users):
    """
    DEVELOPER role can manage applications and view data:
    Must succeed on developer-only and viewer-only endpoints.
    Must be blocked with 403 Forbidden on admin-only endpoints.
    """
    token = auth_service.create_user_token(seed_users["developer"]).access_token
    headers = {"Authorization": f"Bearer {token}"}

    # Developer access -> OK
    r_dev = client.get("/api/test-rbac/developer-only", headers=headers)
    assert r_dev.status_code == status.HTTP_200_OK

    # Viewer access -> OK
    r_viewer = client.get("/api/test-rbac/viewer-only", headers=headers)
    assert r_viewer.status_code == status.HTTP_200_OK

    # Admin access -> 403 Forbidden
    r_admin = client.get("/api/test-rbac/admin-only", headers=headers)
    assert r_admin.status_code == status.HTTP_403_FORBIDDEN
    assert "Operation not permitted" in r_admin.json()["detail"]


def test_viewer_authorization(client, seed_users):
    """
    VIEWER role has read-only access:
    Must succeed on viewer-only endpoints.
    Must be blocked with 403 Forbidden on developer-only and admin-only endpoints.
    """
    token = auth_service.create_user_token(seed_users["viewer"]).access_token
    headers = {"Authorization": f"Bearer {token}"}

    # Viewer access -> OK
    r_viewer = client.get("/api/test-rbac/viewer-only", headers=headers)
    assert r_viewer.status_code == status.HTTP_200_OK

    # Developer access -> 403 Forbidden
    r_dev = client.get("/api/test-rbac/developer-only", headers=headers)
    assert r_dev.status_code == status.HTTP_403_FORBIDDEN

    # Admin access -> 403 Forbidden
    r_admin = client.get("/api/test-rbac/admin-only", headers=headers)
    assert r_admin.status_code == status.HTTP_403_FORBIDDEN


def test_rbac_unauthenticated_request(client):
    """Unauthenticated requests to protected endpoints return 401 Unauthorized."""
    r_admin = client.get("/api/test-rbac/admin-only")
    assert r_admin.status_code == status.HTTP_401_UNAUTHORIZED

    r_dev = client.get("/api/test-rbac/developer-only")
    assert r_dev.status_code == status.HTTP_401_UNAUTHORIZED

    r_viewer = client.get("/api/test-rbac/viewer-only")
    assert r_viewer.status_code == status.HTTP_401_UNAUTHORIZED


# ==============================================================================
# 17. User Registration & Input Validation Tests
# ==============================================================================

def test_user_registration_success(client):
    """POST /api/auth/register creates user and returns 201 Created."""
    response = client.post(
        "/api/auth/register",
        json={
            "name": "New Registered Dev",
            "email": "newdev@forgecloud.internal",
            "password": "SecurePassword123!",
            "role": "DEVELOPER",
        },
    )
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["email"] == "newdev@forgecloud.internal"
    assert data["name"] == "New Registered Dev"
    assert data["role"] == "DEVELOPER"
    assert "password" not in data
    assert "password_hash" not in data

    # Verify newly registered user can immediately log in
    login_resp = client.post(
        "/api/auth/login",
        json={
            "email": "newdev@forgecloud.internal",
            "password": "SecurePassword123!",
        },
    )
    assert login_resp.status_code == status.HTTP_200_OK


def test_user_registration_duplicate_email(client, seed_users):
    """POST /api/auth/register with existing email returns 400 Bad Request."""
    response = client.post(
        "/api/auth/register",
        json={
            "name": "Duplicate User",
            "email": "dev@test.internal",
            "password": "AnotherPassword123!",
            "role": "DEVELOPER",
        },
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "already exists" in response.json()["detail"]


def test_user_registration_invalid_role(client):
    """POST /api/auth/register with invalid role returns 422 Unprocessable Entity."""
    response = client.post(
        "/api/auth/register",
        json={
            "name": "Super Hacker",
            "email": "hacker@test.internal",
            "password": "Password123!",
            "role": "SUPERADMIN",
        },
    )
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_user_registration_invalid_email(client):
    """POST /api/auth/register with invalid email returns 422 Unprocessable Entity."""
    response = client.post(
        "/api/auth/register",
        json={
            "name": "Bad Email User",
            "email": "not-an-email",
            "password": "Password123!",
        },
    )
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_deleted_or_unknown_user_token(client, db_session):
    """A valid token referencing a deleted or nonexistent user ID returns 401."""
    token = create_access_token({"sub": "00000000-0000-0000-0000-000000000000"})
    response = client.get(
        "/api/users/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert "User not found" in response.json()["detail"]
