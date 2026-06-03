from uuid import uuid4

import pytest
from sqlalchemy.exc import IntegrityError

from app.services.employee_service import EmployeeService


EMPLOYEE_PAYLOAD = {
    "full_name": "Jane Doe",
    "country": "United States",
    "job_title": "Software Engineer",
    "department": "Engineering",
    "salary": "95000.00",
}


@pytest.mark.asyncio
async def test_validation_error_includes_field_details(client):
    response = await client.post(
        "/api/v1/employees",
        json={
            **EMPLOYEE_PAYLOAD,
            "salary": "0",
        },
    )

    assert response.status_code == 422
    payload = response.json()
    assert payload["error"]["code"] == "VALIDATION_ERROR"
    assert payload["error"]["details"]
    assert any(detail["field"] == "salary" for detail in payload["error"]["details"])


@pytest.mark.asyncio
async def test_internal_error_does_not_leak_details(client, monkeypatch):
    async def failing_list(*args, **kwargs):
        raise RuntimeError("secret database password leaked")

    monkeypatch.setattr(EmployeeService, "list_employees", failing_list)

    response = await client.get("/api/v1/employees")

    assert response.status_code == 500
    payload = response.json()
    assert payload["error"]["code"] == "INTERNAL_ERROR"
    assert payload["error"]["message"] == "An unexpected error occurred"
    assert "secret" not in response.text


@pytest.mark.asyncio
async def test_integrity_error_returns_conflict(client, monkeypatch):
    async def failing_create(self, data):
        raise IntegrityError("INSERT INTO employees", {}, Exception("duplicate"))

    monkeypatch.setattr(
        "app.repositories.employee_repository.EmployeeRepository.create",
        failing_create,
    )

    response = await client.post("/api/v1/employees", json=EMPLOYEE_PAYLOAD)

    assert response.status_code == 409
    payload = response.json()
    assert payload["error"]["code"] == "CONFLICT"
    assert "constraint" in payload["error"]["message"].lower()


@pytest.mark.asyncio
async def test_create_employee_rolls_back_on_failure(client, monkeypatch):
    async def failing_create(self, data):
        raise IntegrityError("INSERT INTO employees", {}, Exception("failed insert"))

    monkeypatch.setattr(
        "app.repositories.employee_repository.EmployeeRepository.create",
        failing_create,
    )

    list_before = await client.get("/api/v1/employees")
    assert list_before.json()["total_items"] == 0

    response = await client.post("/api/v1/employees", json=EMPLOYEE_PAYLOAD)
    assert response.status_code == 409

    list_after = await client.get("/api/v1/employees")
    assert list_after.json()["total_items"] == 0


@pytest.mark.asyncio
async def test_update_missing_employee_returns_not_found(client):
    response = await client.put(
        f"/api/v1/employees/{uuid4()}",
        json=EMPLOYEE_PAYLOAD,
    )

    assert response.status_code == 404
    assert response.json()["error"]["code"] == "NOT_FOUND"
