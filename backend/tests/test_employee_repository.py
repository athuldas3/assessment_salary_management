import pytest
from pydantic import ValidationError

from app.repositories.employee_repository import calculate_total_pages
from app.schemas.employee import (
    EmployeeListParams,
    EmployeeSortField,
    EmployeeSortSpec,
    SortOrder,
)


def test_calculate_total_pages():
    assert calculate_total_pages(0, 20) == 0
    assert calculate_total_pages(1, 20) == 1
    assert calculate_total_pages(20, 20) == 1
    assert calculate_total_pages(21, 20) == 2


@pytest.mark.asyncio
async def test_list_employees_applies_country_filter(seeded_repository):
    params = EmployeeListParams(country="Germany", page=1, page_size=20)
    employees, total = await seeded_repository.list_employees(params)

    assert total == 1
    assert len(employees) == 1
    assert employees[0].country == "Germany"


@pytest.mark.asyncio
async def test_list_employees_applies_search_filter(seeded_repository):
    params = EmployeeListParams(search="Alice", page=1, page_size=20)
    employees, total = await seeded_repository.list_employees(params)

    assert total == 1
    assert employees[0].full_name.startswith("Alice")


@pytest.mark.asyncio
async def test_list_employees_supports_pagination(seeded_repository):
    params = EmployeeListParams(page=1, page_size=2, sort_by=EmployeeSortField.FULL_NAME)
    employees, total = await seeded_repository.list_employees(params)

    assert total == 4
    assert len(employees) == 2


@pytest.mark.asyncio
async def test_list_employees_sorts_by_salary_desc(seeded_repository):
    params = EmployeeListParams(
        page=1,
        page_size=10,
        sort_by=EmployeeSortField.SALARY,
        sort_order=SortOrder.DESC,
    )
    employees, _ = await seeded_repository.list_employees(params)

    salaries = [employee.salary for employee in employees]
    assert salaries == sorted(salaries, reverse=True)


@pytest.mark.asyncio
async def test_list_employees_supports_multi_sort(seeded_repository):
    params = EmployeeListParams(
        page=1,
        page_size=10,
        sort=[
            EmployeeSortSpec(field=EmployeeSortField.COUNTRY, order=SortOrder.ASC),
            EmployeeSortSpec(field=EmployeeSortField.SALARY, order=SortOrder.DESC),
        ],
    )
    employees, _ = await seeded_repository.list_employees(params)

    assert [employee.full_name for employee in employees] == [
        "Carol Germany HR",
        "David UK Analyst",
        "Bob US Engineer",
        "Alice US Engineer",
    ]


def test_employee_list_params_rejects_duplicate_sort_fields():
    with pytest.raises(ValidationError):
        EmployeeListParams(
            page=1,
            page_size=10,
            sort=[
                EmployeeSortSpec(field=EmployeeSortField.COUNTRY, order=SortOrder.ASC),
                EmployeeSortSpec(field=EmployeeSortField.COUNTRY, order=SortOrder.DESC),
            ],
        )


def test_employee_list_params_parses_sort_queries():
    params = EmployeeListParams(
        page=1,
        page_size=10,
        sort_queries=["country:asc", "salary:desc"],
    )

    assert params.resolved_sorts == [
        EmployeeSortSpec(field=EmployeeSortField.COUNTRY, order=SortOrder.ASC),
        EmployeeSortSpec(field=EmployeeSortField.SALARY, order=SortOrder.DESC),
    ]


@pytest.mark.asyncio
async def test_get_filter_metadata_returns_distinct_values(seeded_repository):
    metadata = await seeded_repository.get_filter_metadata()

    assert metadata["countries"] == ["Germany", "United Kingdom", "United States"]
    assert "Software Engineer" in metadata["job_titles"]
    assert "Engineering" in metadata["departments"]
