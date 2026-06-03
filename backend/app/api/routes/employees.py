from uuid import UUID

from fastapi import APIRouter, Depends, Query, Response, status
from fastapi.exceptions import RequestValidationError
from pydantic import ValidationError

from app.api.deps import get_employee_service
from app.schemas.employee import (
    EmployeeCreate,
    EmployeeFilterMetadataResponse,
    EmployeeListParams,
    EmployeeResponse,
    EmployeeSortField,
    EmployeeUpdate,
    PaginatedEmployeeResponse,
    SortOrder,
)
from app.services.employee_service import EmployeeService

router = APIRouter(prefix="/employees", tags=["employees"])


def get_employee_list_params(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    country: str | None = None,
    job_title: str | None = None,
    department: str | None = None,
    search: str | None = None,
    sort: list[str] = Query(default=[]),
    sort_by: EmployeeSortField = EmployeeSortField.FULL_NAME,
    sort_order: SortOrder = SortOrder.ASC,
) -> EmployeeListParams:
    try:
        return EmployeeListParams(
            page=page,
            page_size=page_size,
            country=country,
            job_title=job_title,
            department=department,
            search=search,
            sort_queries=sort,
            sort_by=sort_by,
            sort_order=sort_order,
        )
    except ValidationError as exc:
        raise RequestValidationError(exc.errors()) from exc


@router.get("/metadata/filters", response_model=EmployeeFilterMetadataResponse)
async def get_employee_filter_metadata(
    service: EmployeeService = Depends(get_employee_service),
) -> EmployeeFilterMetadataResponse:
    return await service.get_filter_metadata()


@router.get("", response_model=PaginatedEmployeeResponse)
async def list_employees(
    params: EmployeeListParams = Depends(get_employee_list_params),
    service: EmployeeService = Depends(get_employee_service),
) -> PaginatedEmployeeResponse:
    return await service.list_employees(params)


@router.get("/{employee_id}", response_model=EmployeeResponse)
async def get_employee(
    employee_id: UUID,
    service: EmployeeService = Depends(get_employee_service),
) -> EmployeeResponse:
    return await service.get_employee(employee_id)


@router.post("", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
async def create_employee(
    payload: EmployeeCreate,
    service: EmployeeService = Depends(get_employee_service),
) -> EmployeeResponse:
    return await service.create_employee(payload)


@router.put("/{employee_id}", response_model=EmployeeResponse)
async def update_employee(
    employee_id: UUID,
    payload: EmployeeUpdate,
    service: EmployeeService = Depends(get_employee_service),
) -> EmployeeResponse:
    return await service.update_employee(employee_id, payload)


@router.delete("/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_employee(
    employee_id: UUID,
    service: EmployeeService = Depends(get_employee_service),
) -> Response:
    await service.delete_employee(employee_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
