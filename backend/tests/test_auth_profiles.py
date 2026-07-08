from uuid import uuid4

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def create_test_user():
    unique_email = f"test-{uuid4().hex}@example.com"
    password = "password123"

    signup_response = client.post(
        "/api/auth/signup",
        json={
            "email": unique_email,
            "password": password,
            "full_name": "Test User",
        },
    )

    assert signup_response.status_code == 201

    login_response = client.post(
        "/api/auth/login",
        data={
            "username": unique_email,
            "password": password,
        },
    )

    assert login_response.status_code == 200

    token = login_response.json()["access_token"]

    return unique_email, password, token


def test_signup_login_and_current_user():
    email, _, token = create_test_user()

    response = client.get(
        "/api/auth/me",
        headers={
            "Authorization": f"Bearer {token}",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["email"] == email
    assert data["full_name"] == "Test User"


def test_create_and_list_profiles():
    _, _, token = create_test_user()

    create_response = client.post(
        "/api/profiles/",
        json={
            "name": "Main",
            "avatar_url": None,
            "maturity_rating": "PG-13",
        },
        headers={
            "Authorization": f"Bearer {token}",
        },
    )

    assert create_response.status_code == 201

    list_response = client.get(
        "/api/profiles/",
        headers={
            "Authorization": f"Bearer {token}",
        },
    )

    assert list_response.status_code == 200

    profiles = list_response.json()

    assert len(profiles) >= 1
    assert any(profile["name"] == "Main" for profile in profiles)