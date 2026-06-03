from decimal import Decimal
from uuid import uuid4

import pytest

from app.core.exceptions import NotFoundError
from app.schemas.employee import EmployeeCreate, EmployeeListParams, EmployeeUpdate
from tests.helpers import SAMPLE_EMPLOYEES, seed_sample_employees


@pytest.mark.asyncio
async def test_list_employees_returns_pagination_metadata(employee_service, seeded_repository):
    result = await employee_service.list_employees(EmployeeListParams(page=1, page_size=2))

    assert result.total_items == 4
    assert result.total_pages == 2
    assert result.page == 1
    assert result.page_size == 2
    assert len(result.items) == 2


@pytest.mark.asyncio
async def test_get_employee_raises_not_found(employee_service):
    with pytest.raises(NotFoundError, match="Employee not found"):
        await employee_service.get_employee(uuid4())


@pytest.mark.asyncio
async def test_create_employee_persists_record(employee_service, employee_repository):
    created = await employee_service.create_employee(
        EmployeeCreate(
            full_name="Service Layer Employee",
            country="Canada",
            job_title="Finance Analyst",
            department="Finance",
            salary=Decimal("88000.00"),
        )
    )

    stored = await employee_repository.get_by_id(created.id)
    assert stored is not None
    assert stored.full_name == "Service Layer Employee"
    assert created.model_dump(mode="json")["salary"] == "88000.00"


@pytest.mark.asyncio
async def test_update_employee_changes_salary(employee_service, seeded_repository):
    employees, _ = await seeded_repository.list_employees(EmployeeListParams(page=1, page_size=1))
    employee_id = employees[0].id

    updated = await employee_service.update_employee(
        employee_id,
        EmployeeUpdate(
            full_name=employees[0].full_name,
            country=employees[0].country,
            job_title=employees[0].job_title,
            department=employees[0].department,
            salary=Decimal("55555.55"),
        ),
    )

    assert updated.model_dump(mode="json")["salary"] == "55555.55"


@pytest.mark.asyncio
async def test_delete_employee_removes_record(employee_service, employee_repository, seeded_repository):
    employees, _ = await seeded_repository.list_employees(EmployeeListParams(page=1, page_size=1))
    employee_id = employees[0].id

    await employee_service.delete_employee(employee_id)

    assert await employee_repository.get_by_id(employee_id) is None


@pytest.mark.asyncio
async def test_get_filter_metadata_via_service(employee_service, seeded_repository):
    metadata = await employee_service.get_filter_metadata()

    assert len(metadata.countries) == 3
    assert len(metadata.job_titles) >= 3
