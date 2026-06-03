from decimal import Decimal
from uuid import uuid4

import pytest
from sqlalchemy.exc import IntegrityError

from app.core.exceptions import NotFoundError
from app.schemas.employee import EmployeeCreate, EmployeeListParams, EmployeeUpdate
from tests.helpers import seed_sample_employees


@pytest.mark.asyncio
async def test_update_missing_employee_does_not_persist_changes(
    employee_service,
    employee_repository,
):
    await seed_sample_employees(employee_repository)
    _, original_count = await employee_repository.list_employees(
        EmployeeListParams(page=1, page_size=100)
    )

    with pytest.raises(NotFoundError):
        await employee_service.update_employee(
            uuid4(),
            EmployeeUpdate(
                full_name="Missing",
                country="Canada",
                job_title="Finance Analyst",
                department="Finance",
                salary=Decimal("1000.00"),
            ),
        )

    _, total = await employee_repository.list_employees(
        EmployeeListParams(page=1, page_size=100)
    )
    assert total == original_count


@pytest.mark.asyncio
async def test_failed_create_does_not_persist_partial_data(
    employee_service,
    employee_repository,
    monkeypatch,
):
    async def failing_create(self, data):
        raise IntegrityError("INSERT INTO employees", {}, Exception("failed insert"))

    monkeypatch.setattr(
        "app.repositories.employee_repository.EmployeeRepository.create",
        failing_create,
    )

    with pytest.raises(IntegrityError):
        await employee_service.create_employee(
            EmployeeCreate(
                full_name="Rollback Test",
                country="Canada",
                job_title="Finance Analyst",
                department="Finance",
                salary=Decimal("90000.00"),
            )
        )

    _, total = await employee_repository.list_employees(EmployeeListParams(page=1, page_size=10))
    assert total == 0
