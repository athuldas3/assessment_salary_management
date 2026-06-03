import pytest

from app.schemas.insights import CountryJobTitleInsightParams
from tests.helpers import seed_sample_employees


@pytest.mark.asyncio
async def test_country_insights_aggregate_exact_values(insights_repository, employee_repository):
    await seed_sample_employees(employee_repository)
    items = await insights_repository.get_country_insights()
    countries = {item["country"]: item for item in items}

    assert countries["United States"]["min_salary"] == "100000.00"
    assert countries["United States"]["max_salary"] == "120000.00"
    assert countries["United States"]["avg_salary"] == "110000.00"
    assert countries["United States"]["employee_count"] == 2
    assert countries["United States"]["salary_range"] == "100000.00 - 120000.00"

    assert countries["Germany"]["avg_salary"] == "80000.00"
    assert countries["Germany"]["employee_count"] == 1


@pytest.mark.asyncio
async def test_department_insights_aggregate_exact_values(insights_repository, employee_repository):
    await seed_sample_employees(employee_repository)
    items = await insights_repository.get_department_insights()
    departments = {item["department"]: item for item in items}

    assert departments["Engineering"]["avg_salary"] == "110000.00"
    assert departments["Engineering"]["employee_count"] == 2
    assert departments["HR"]["avg_salary"] == "80000.00"


@pytest.mark.asyncio
async def test_job_title_insights_aggregate_exact_values(insights_repository, employee_repository):
    await seed_sample_employees(employee_repository)
    items = await insights_repository.get_job_title_insights()
    titles = {item["job_title"]: item for item in items}

    assert titles["Software Engineer"]["avg_salary"] == "110000.00"
    assert titles["Software Engineer"]["employee_count"] == 2


@pytest.mark.asyncio
async def test_country_job_title_insight_aggregate_exact_values(
    insights_repository,
    employee_repository,
):
    await seed_sample_employees(employee_repository)
    result = await insights_repository.get_country_job_title_insight(
        country="United States",
        job_title="Software Engineer",
    )

    assert result["avg_salary"] == "110000.00"
    assert result["employee_count"] == 2


@pytest.mark.asyncio
async def test_insights_service_returns_schema_models(insights_service, employee_repository):
    await seed_sample_employees(employee_repository)
    response = await insights_service.get_country_insights()

    assert len(response.items) == 3
    assert response.items[0].country in {"Germany", "United Kingdom", "United States"}


@pytest.mark.asyncio
async def test_insights_service_country_job_title(insights_service, employee_repository):
    await seed_sample_employees(employee_repository)
    response = await insights_service.get_country_job_title_insight(
        CountryJobTitleInsightParams(country="Germany", job_title="HR Manager")
    )

    assert response.country == "Germany"
    assert response.job_title == "HR Manager"
    assert response.avg_salary == "80000.00"
    assert response.employee_count == 1
