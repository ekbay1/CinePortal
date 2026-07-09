from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_list_content():
    response = client.get("/api/content/")

    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_homepage_content():
    response = client.get("/api/content/home")

    assert response.status_code == 200

    data = response.json()

    assert "rows" in data
    assert isinstance(data["rows"], list)


def test_search_content():
    response = client.get("/api/search?q=action")

    assert response.status_code == 200

    data = response.json()

    assert "results" in data
    assert "total" in data
