from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_generate_recipe_mock_mode(monkeypatch):
    # Force mock mode regardless of what's in the developer's local .env,
    # so this test is deterministic and doesn't hit a real LLM.
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)

    payload = {
        "ingredients": [{"name": "chicken thighs"}],
        "equipment": [
            {"name": "air fryer", "category": "appliance", "capabilities": {}}
        ],
        "time_constraint_min": 15,
        "activity_level": "heavy_workout",
    }
    response = client.post("/generate-recipe", json=payload)
    assert response.status_code == 200

    data = response.json()
    assert "title" in data
    assert len(data["steps"]) > 0
