from decimal import Decimal

import pytest
from sqlalchemy import select

from app.models.employee import Employee
from app.services.seed_data import build_employee_record, generate_employee_records
from app.services.seed_service import SeedService


def test_build_employee_record_is_deterministic():
    first = build_employee_record(42)
    second = build_employee_record(42)

    assert first == second
    assert first.country == "United States"
    assert first.job_title == "Software Engineer"
    assert first.department == "Engineering"
    assert first.salary > Decimal("0")


def test_build_employee_record_uses_expected_country_for_index():
    record = build_employee_record(3)

    assert record.country == "India"


def test_generate_employee_records_batch_size():
    records = generate_employee_records(0, 3)

    assert len(records) == 3
    assert records[0]["full_name"] == build_employee_record(0).full_name
    assert records[2]["id"] == build_employee_record(2).id


@pytest.mark.asyncio
async def test_seed_service_inserts_expected_count(db_session):
    service = SeedService(db_session)
    total = await service.seed_employees(count=100, batch_size=25, clear_existing=True)

    assert total == 100
    assert await service.count_employees() == 100


@pytest.mark.asyncio
async def test_seed_service_is_repeatable(db_session):
    service = SeedService(db_session)

    await service.seed_employees(count=50, batch_size=10, clear_existing=True)
    first = await service.count_employees()

    await service.seed_employees(count=50, batch_size=10, clear_existing=True)
    second = await service.count_employees()

    assert first == 50
    assert second == 50


@pytest.mark.asyncio
async def test_seed_service_sample_record(db_session):
    service = SeedService(db_session)
    await service.seed_employees(count=1, batch_size=1, clear_existing=True)

    expected = build_employee_record(0)
    result = await db_session.execute(select(Employee))
    employee = result.scalars().one()

    assert employee.id == expected.id
    assert employee.full_name == expected.full_name
    assert employee.country == expected.country
    assert employee.job_title == expected.job_title
    assert employee.department == expected.department
    assert employee.salary == expected.salary
