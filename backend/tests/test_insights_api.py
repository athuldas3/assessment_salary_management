import pytest


async def seed_insight_employees(client):
    employees = [
        {
            "full_name": "Alice US Engineer",
            "country": "United States",
            "job_title": "Software Engineer",
            "department": "Engineering",
            "salary": "100000.00",
        },
        {
            "full_name": "Bob US Engineer",
            "country": "United States",
            "job_title": "Software Engineer",
            "department": "Engineering",
            "salary": "120000.00",
        },
        {
            "full_name": "Carol Germany HR",
            "country": "Germany",
            "job_title": "HR Manager",
            "department": "HR",
            "salary": "80000.00",
        },
    ]

    for employee in employees:
        response = await client.post("/api/v1/employees", json=employee)
        assert response.status_code == 201


@pytest.mark.asyncio
async def test_insights_by_country(client):
    await seed_insight_employees(client)

    response = await client.get("/api/v1/insights/by-country")

    assert response.status_code == 200
    items = {item["country"]: item for item in response.json()["items"]}

    assert items["United States"]["min_salary"] == "100000.00"
    assert items["United States"]["max_salary"] == "120000.00"
    assert items["United States"]["avg_salary"] == "110000.00"
    assert items["United States"]["employee_count"] == 2
    assert items["United States"]["salary_range"] == "100000.00 - 120000.00"

    assert items["Germany"]["min_salary"] == "80000.00"
    assert items["Germany"]["max_salary"] == "80000.00"
    assert items["Germany"]["avg_salary"] == "80000.00"
    assert items["Germany"]["employee_count"] == 1


@pytest.mark.asyncio
async def test_insights_by_department(client):
    await seed_insight_employees(client)

    response = await client.get("/api/v1/insights/by-department")
    items = {item["department"]: item for item in response.json()["items"]}

    assert response.status_code == 200
    assert items["Engineering"]["avg_salary"] == "110000.00"
    assert items["Engineering"]["employee_count"] == 2
    assert items["HR"]["avg_salary"] == "80000.00"
    assert items["HR"]["employee_count"] == 1


@pytest.mark.asyncio
async def test_insights_by_job_title(client):
    await seed_insight_employees(client)

    response = await client.get("/api/v1/insights/by-job-title")
    items = {item["job_title"]: item for item in response.json()["items"]}

    assert response.status_code == 200
    assert items["Software Engineer"]["avg_salary"] == "110000.00"
    assert items["Software Engineer"]["employee_count"] == 2
    assert items["HR Manager"]["avg_salary"] == "80000.00"
    assert items["HR Manager"]["employee_count"] == 1


@pytest.mark.asyncio
async def test_country_job_title_insight(client):
    await seed_insight_employees(client)

    response = await client.get(
        "/api/v1/insights/country-job-title",
        params={"country": "United States", "job_title": "Software Engineer"},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["country"] == "United States"
    assert payload["job_title"] == "Software Engineer"
    assert payload["avg_salary"] == "110000.00"
    assert payload["employee_count"] == 2


@pytest.mark.asyncio
async def test_country_job_title_insight_no_matches(client):
    response = await client.get(
        "/api/v1/insights/country-job-title",
        params={"country": "United States", "job_title": "Software Engineer"},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["avg_salary"] is None
    assert payload["employee_count"] == 0


@pytest.mark.asyncio
async def test_country_job_title_insight_validation_error(client):
    response = await client.get("/api/v1/insights/country-job-title")

    assert response.status_code == 422
    assert response.json()["error"]["code"] == "VALIDATION_ERROR"
