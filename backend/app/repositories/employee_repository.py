from dataclasses import dataclass
from datetime import datetime, timezone
from decimal import Decimal
from math import ceil
from uuid import UUID

from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.employee import Employee
from app.schemas.employee import EmployeeListParams, EmployeeSortField, SortOrder

SORT_COLUMN_MAP = {
    EmployeeSortField.FULL_NAME: Employee.full_name,
    EmployeeSortField.COUNTRY: Employee.country,
    EmployeeSortField.JOB_TITLE: Employee.job_title,
    EmployeeSortField.DEPARTMENT: Employee.department,
    EmployeeSortField.SALARY: Employee.salary,
    EmployeeSortField.CREATED_AT: Employee.created_at,
    EmployeeSortField.UPDATED_AT: Employee.updated_at,
}


@dataclass
class EmployeeWriteData:
    full_name: str
    country: str
    job_title: str
    department: str
    salary: Decimal


class EmployeeRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    def _apply_filters(self, query, params: EmployeeListParams):
        if params.country:
            query = query.where(Employee.country == params.country)
        if params.job_title:
            query = query.where(Employee.job_title == params.job_title)
        if params.department:
            query = query.where(Employee.department == params.department)
        if params.search:
            query = query.where(Employee.full_name.ilike(f"%{params.search}%"))
        return query

    async def list_employees(
        self,
        params: EmployeeListParams,
    ) -> tuple[list[Employee], int]:
        query = select(Employee)
        count_query = select(func.count()).select_from(Employee)

        query = self._apply_filters(query, params)
        count_query = self._apply_filters(count_query, params)

        sort_column = SORT_COLUMN_MAP[params.sort_by]
        if params.sort_order == SortOrder.DESC:
            query = query.order_by(sort_column.desc())
        else:
            query = query.order_by(sort_column.asc())

        offset = (params.page - 1) * params.page_size
        query = query.offset(offset).limit(params.page_size)

        result = await self.session.execute(query)
        employees = list(result.scalars().all())

        count_result = await self.session.execute(count_query)
        total_items = count_result.scalar_one()

        return employees, total_items

    async def get_by_id(self, employee_id: UUID) -> Employee | None:
        result = await self.session.execute(
            select(Employee).where(Employee.id == employee_id)
        )
        return result.scalar_one_or_none()

    async def create(self, data: EmployeeWriteData) -> Employee:
        employee = Employee(**data.__dict__)
        self.session.add(employee)
        await self.session.flush()
        await self.session.refresh(employee)
        return employee

    async def update(self, employee: Employee, data: EmployeeWriteData) -> Employee:
        employee.full_name = data.full_name
        employee.country = data.country
        employee.job_title = data.job_title
        employee.department = data.department
        employee.salary = data.salary
        employee.updated_at = datetime.now(timezone.utc)
        await self.session.flush()
        await self.session.refresh(employee)
        return employee

    async def delete(self, employee: Employee) -> None:
        await self.session.delete(employee)
        await self.session.flush()

    async def get_filter_metadata(self) -> dict[str, list[str]]:
        countries_result = await self.session.execute(
            select(Employee.country).distinct().order_by(Employee.country)
        )
        job_titles_result = await self.session.execute(
            select(Employee.job_title).distinct().order_by(Employee.job_title)
        )
        departments_result = await self.session.execute(
            select(Employee.department).distinct().order_by(Employee.department)
        )

        return {
            "countries": list(countries_result.scalars().all()),
            "job_titles": list(job_titles_result.scalars().all()),
            "departments": list(departments_result.scalars().all()),
        }

    async def delete_all(self) -> None:
        await self.session.execute(delete(Employee))


def calculate_total_pages(total_items: int, page_size: int) -> int:
    if total_items == 0:
        return 0
    return ceil(total_items / page_size)
