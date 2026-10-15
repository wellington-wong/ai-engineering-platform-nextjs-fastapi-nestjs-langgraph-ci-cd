import pytest
from fastapi.testclient import TestClient

import main


@pytest.fixture(autouse=True)
def clean_sessions(monkeypatch):
    main.SESSIONS.clear()
    monkeypatch.setenv("OPENAI_API_KEY", "test")


@pytest.fixture
def client():
    return TestClient(main.app)


def fake_step(state):
    return main.FormStep(title=f"Step {state['step_index'] + 1}", description="Tell us more.", fields=[
        main.FormField(id="purpose", label="Purpose", type="textarea", required=True),
        main.FormField(id="format", label="Format", type="select", choices=["web", "mobile"]),
    ])


def fake_overview(state):
    return main.ProjectOverview(title="Example", sections=main.OverviewSection(
        summary="Summary", goals=["Goal"], problem="Problem", audience=["Users"], solution="Solution",
        scope=["Scope"], requirements=["Requirement"], risks=["Risk"], assumptions=["Assumption"], open_questions=[],
    ))


def install_fakes(monkeypatch):
    monkeypatch.setattr(main, "_generate_step", fake_step)
    monkeypatch.setattr(main, "_generate_overview", fake_overview)


def test_create_and_retrieve_dynamic_step(client, monkeypatch):
    install_fakes(monkeypatch)
    response = client.post("/sessions", json={"project_description": "A community garden"})
    assert response.status_code == 201
    data = response.json()
    assert data["current_step"]["title"] == "Step 1"
    assert data["max_steps"] == 6
    assert client.get(f"/sessions/{data['id']}").json()["current_step"] == data["current_step"]


def test_validation_and_adaptive_workflow_completion(client, monkeypatch):
    install_fakes(monkeypatch)
    session_id = client.post("/sessions", json={"project_description": "A project"}).json()["id"]
    invalid = client.post(f"/sessions/{session_id}/answers", json={"step_index": 0, "answers": {"purpose": "x", "format": "wrong"}})
    assert invalid.status_code == 422
    response = None
    for index in range(6):
        response = client.post(f"/sessions/{session_id}/answers", json={"step_index": index, "answers": {"purpose": f"Answer {index}", "format": "web"}})
        assert response.status_code == 200
        if index < 5:
            assert response.json()["current_step"]["title"] == f"Step {index + 2}"
    assert response.json()["completed"] is True
    assert response.json()["step_index"] == 6
    assert len(response.json()["interview_history"]) == 6
    assert client.get(f"/sessions/{session_id}/overview").status_code == 200
    assert client.post(f"/sessions/{session_id}/answers", json={"step_index": 6, "answers": {}}).status_code == 409


def test_required_and_exact_field_validation(client, monkeypatch):
    install_fakes(monkeypatch)
    session_id = client.post("/sessions", json={"project_description": "A project"}).json()["id"]
    assert client.post(f"/sessions/{session_id}/answers", json={"step_index": 0, "answers": {"purpose": ""}}).status_code == 422
    assert client.post(f"/sessions/{session_id}/answers", json={"step_index": 0, "answers": {"purpose": "x", "format": "web", "extra": 1}}).status_code == 422


def test_answer_type_validation():
    step = main.FormStep(title="Details", description="Details", fields=[
        main.FormField(id="count", label="Count", type="number"),
        main.FormField(id="date", label="Date", type="date"),
        main.FormField(id="tags", label="Tags", type="checkbox", choices=["a", "b"]),
    ])
    main._validate_answers(step, {"count": 3, "date": "2026-10-15", "tags": ["a", "b"]})
    for invalid in ({"count": True}, {"date": "15/10/2026"}, {"tags": ["unknown"]}, {"tags": "a"}):
        with pytest.raises(Exception):
            main._validate_answers(step, invalid)


def test_generation_failure_preserves_answers_and_same_retry_recovers(client, monkeypatch):
    install_fakes(monkeypatch)
    session_id = client.post("/sessions", json={"project_description": "A project"}).json()["id"]
    original = main._generate_step
    calls = {"n": 0}

    def fail_once(state):
        calls["n"] += 1
        if calls["n"] == 1:
            raise RuntimeError("temporary model failure")
        return original(state)

    monkeypatch.setattr(main, "_generate_step", fail_once)
    payload = {"step_index": 0, "answers": {"purpose": "Accepted", "format": "web"}}
    assert client.post(f"/sessions/{session_id}/answers", json=payload).status_code == 502
    saved = client.get(f"/sessions/{session_id}").json()
    assert saved["user_facts"]["step_1.purpose"] == "Accepted"
    assert len(saved["interview_history"]) == 1
    assert client.post(f"/sessions/{session_id}/answers", json=payload).status_code == 200
    assert len(client.get(f"/sessions/{session_id}").json()["interview_history"]) == 1


def test_create_llm_failure_does_not_create_session(client, monkeypatch):
    monkeypatch.setattr(main, "_generate_step", lambda state: (_ for _ in ()).throw(RuntimeError("offline")))
    assert client.post("/sessions", json={"project_description": "A project"}).status_code == 502
    assert main.SESSIONS == {}
