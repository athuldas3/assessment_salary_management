from uuid import uuid4

import pytest


EMPLOYEE_PAYLOAD = {
    "full_name": "Jane Doe",
    "country": "United States",
    "job_title": "Software Engineer",
    "department": "Engineering",
    "salary": "95000.00",
}


@pytest.mark.asyncio
async def test_create_and_get_employee(client):
    create_response = await client.post("/api/v1/employees", json=EMPLOYEE_PAYLOAD)

    assert create_response.status_code == 201
    created = create_response.json()
    assert created["full_name"] == EMPLOYEE_PAYLOAD["full_name"]
    assert created["salary"] == "95000.00"

    get_response = await client.get(f"/api/v1/employees/{created['id']}")
    assert get_response.status_code == 200
    assert get_response.json()["id"] == created["id"]


@pytest.mark.asyncio
async def test_list_employees_with_filters(client):
    await client.post("/api/v1/employees", json=EMPLOYEE_PAYLOAD)
    await client.post(
        "/api/v1/employees",
        json={
            **EMPLOYEE_PAYLOAD,
            "full_name": "John Smith",
            "country": "Germany",
        },
    )

    response = await client.get(
        "/api/v1/employees",
        params={"country": "United States", "job_title": "Software Engineer"},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["total_items"] == 1
    assert len(payload["items"]) == 1
    assert payload["items"][0]["country"] == "United States"


@pytest.mark.asyncio
async def test_update_employee(client):
    create_response = await client.post("/api/v1/employees", json=EMPLOYEE_PAYLOAD)
    employee_id = create_response.json()["id"]

    update_response = await client.put(
        f"/api/v1/employees/{employee_id}",
        json={
            **EMPLOYEE_PAYLOAD,
            "salary": "99000.00",
        },
    )

    assert update_response.status_code == 200
    assert update_response.json()["salary"] == "99000.00"


@pytest.mark.asyncio
async def test_delete_employee(client):
    create_response = await client.post("/api/v1/employees", json=EMPLOYEE_PAYLOAD)
    employee_id = create_response.json()["id"]

    delete_response = await client.delete(f"/api/v1/employees/{employee_id}")
    assert delete_response.status_code == 204

    get_response = await client.get(f"/api/v1/employees/{employee_id}")
    assert get_response.status_code == 404
    assert get_response.json()["error"]["code"] == "NOT_FOUND"


@pytest.mark.asyncio
async def test_get_employee_not_found(client):
    response = await client.get(f"/api/v1/employees/{uuid4()}")

    assert response.status_code == 404
    assert response.json()["error"]["message"] == "Employee not found"


@pytest.mark.asyncio
async def test_filter_metadata(client):
    await client.post("/api/v1/employees", json=EMPLOYEE_PAYLOAD)

    response = await client.get("/api/v1/employees/metadata/filters")

    assert response.status_code == 200
    payload = response.json()
    assert "United States" in payload["countries"]
    assert "Software Engineer" in payload["job_titles"]
    assert "Engineering" in payload["departments"]


@pytest.mark.asyncio
async def test_create_employee_validation_error(client):
    response = await client.post(
        "/api/v1/employees",
        json={
            **EMPLOYEE_PAYLOAD,
            "salary": "0",
        },
    )

    assert response.status_code == 422
    assert response.json()["error"]["code"] == "VALIDATION_ERROR"


@pytest.mark.asyncio
async def test_list_employees_with_multi_sort(client):
    await client.post("/api/v1/employees", json=EMPLOYEE_PAYLOAD)
    await client.post(
        "/api/v1/employees",
        json={
            **EMPLOYEE_PAYLOAD,
            "full_name": "John Smith",
            "country": "Germany",
            "salary": "80000.00",
        },
    )
    await client.post(
        "/api/v1/employees",
        json={
            **EMPLOYEE_PAYLOAD,
            "full_name": "Zara Analyst",
            "country": "Germany",
            "job_title": "Data Analyst",
            "department": "Operations",
            "salary": "90000.00",
        },
    )

    response = await client.get(
        "/api/v1/employees",
        params=[
            ("sort", "country:asc"),
            ("sort", "salary:desc"),
            ("page_size", "10"),
        ],
    )

    assert response.status_code == 200
    names = [item["full_name"] for item in response.json()["items"]]
    assert names == ["Zara Analyst", "John Smith", "Jane Doe"]


@pytest.mark.asyncio
async def test_list_employees_invalid_sort_field(client):
    response = await client.get(
        "/api/v1/employees",
        params={"sort": "badfield:asc"},
    )

    assert response.status_code == 422
    assert response.json()["error"]["code"] == "VALIDATION_ERROR"
