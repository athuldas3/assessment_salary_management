from decimal import Decimal
from enum import Enum
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_serializer


class SortOrder(str, Enum):
    ASC = "asc"
    DESC = "desc"


class EmployeeSortField(str, Enum):
    FULL_NAME = "full_name"
    COUNTRY = "country"
    JOB_TITLE = "job_title"
    DEPARTMENT = "department"
    SALARY = "salary"
    CREATED_AT = "created_at"
    UPDATED_AT = "updated_at"


class EmployeeBase(BaseModel):
    full_name: str = Field(min_length=1, max_length=200)
    country: str = Field(min_length=1, max_length=100)
    job_title: str = Field(min_length=1, max_length=150)
    department: str = Field(min_length=1, max_length=150)
    salary: Decimal = Field(gt=0)


class EmployeeCreate(EmployeeBase):
    pass


class EmployeeUpdate(EmployeeBase):
    pass


class EmployeeResponse(EmployeeBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    created_at: str
    updated_at: str

    @field_serializer("salary")
    def serialize_salary(self, value: Decimal) -> str:
        return f"{value:.2f}"


class PaginatedEmployeeResponse(BaseModel):
    items: list[EmployeeResponse]
    page: int
    page_size: int
    total_items: int
    total_pages: int


class EmployeeFilterMetadataResponse(BaseModel):
    countries: list[str]
    job_titles: list[str]
    departments: list[str]


class EmployeeListParams(BaseModel):
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)
    country: str | None = None
    job_title: str | None = None
    department: str | None = None
    search: str | None = None
    sort_by: EmployeeSortField = EmployeeSortField.FULL_NAME
    sort_order: SortOrder = SortOrder.ASC
