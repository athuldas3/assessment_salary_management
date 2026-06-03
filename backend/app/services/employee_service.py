from uuid import UUID

from app.core.exceptions import NotFoundError
from app.repositories.employee_repository import (
    EmployeeRepository,
    EmployeeWriteData,
    calculate_total_pages,
)
from app.schemas.employee import (
    EmployeeCreate,
    EmployeeFilterMetadataResponse,
    EmployeeListParams,
    EmployeeResponse,
    EmployeeUpdate,
    PaginatedEmployeeResponse,
)


class EmployeeService:
    def __init__(self, repository: EmployeeRepository) -> None:
        self.repository = repository

    @staticmethod
    def _to_response(employee) -> EmployeeResponse:
        return EmployeeResponse(
            id=employee.id,
            full_name=employee.full_name,
            country=employee.country,
            job_title=employee.job_title,
            department=employee.department,
            salary=employee.salary,
            created_at=employee.created_at.isoformat(),
            updated_at=employee.updated_at.isoformat(),
        )

    @staticmethod
    def _to_write_data(data: EmployeeCreate | EmployeeUpdate) -> EmployeeWriteData:
        return EmployeeWriteData(
            full_name=data.full_name,
            country=data.country,
            job_title=data.job_title,
            department=data.department,
            salary=data.salary,
        )

    async def list_employees(self, params: EmployeeListParams) -> PaginatedEmployeeResponse:
        employees, total_items = await self.repository.list_employees(params)
        total_pages = calculate_total_pages(total_items, params.page_size)

        return PaginatedEmployeeResponse(
            items=[self._to_response(employee) for employee in employees],
            page=params.page,
            page_size=params.page_size,
            total_items=total_items,
            total_pages=total_pages,
        )

    async def get_employee(self, employee_id: UUID) -> EmployeeResponse:
        employee = await self.repository.get_by_id(employee_id)
        if employee is None:
            raise NotFoundError("Employee not found")
        return self._to_response(employee)

    async def create_employee(self, data: EmployeeCreate) -> EmployeeResponse:
        try:
            employee = await self.repository.create(self._to_write_data(data))
            await self.repository.session.commit()
            return self._to_response(employee)
        except Exception:
            await self.repository.session.rollback()
            raise

    async def update_employee(
        self,
        employee_id: UUID,
        data: EmployeeUpdate,
    ) -> EmployeeResponse:
        try:
            employee = await self.repository.get_by_id(employee_id)
            if employee is None:
                raise NotFoundError("Employee not found")

            updated = await self.repository.update(employee, self._to_write_data(data))
            await self.repository.session.commit()
            return self._to_response(updated)
        except NotFoundError:
            await self.repository.session.rollback()
            raise
        except Exception:
            await self.repository.session.rollback()
            raise

    async def delete_employee(self, employee_id: UUID) -> None:
        try:
            employee = await self.repository.get_by_id(employee_id)
            if employee is None:
                raise NotFoundError("Employee not found")

            await self.repository.delete(employee)
            await self.repository.session.commit()
        except NotFoundError:
            await self.repository.session.rollback()
            raise
        except Exception:
            await self.repository.session.rollback()
            raise

    async def get_filter_metadata(self) -> EmployeeFilterMetadataResponse:
        metadata = await self.repository.get_filter_metadata()
        return EmployeeFilterMetadataResponse(**metadata)
