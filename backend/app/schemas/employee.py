from decimal import Decimal
from enum import Enum
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_serializer, model_validator


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


MAX_SORT_FIELDS = len(EmployeeSortField)


class EmployeeSortSpec(BaseModel):
    field: EmployeeSortField
    order: SortOrder = SortOrder.ASC


def parse_sort_query_values(values: list[str]) -> list[EmployeeSortSpec]:
    specs: list[EmployeeSortSpec] = []

    for value in values:
        raw = value.strip()
        if not raw:
            raise ValueError("Sort value cannot be empty")

        if ":" in raw:
            field_raw, order_raw = raw.split(":", 1)
            order = SortOrder(order_raw.strip().lower())
        else:
            field_raw = raw
            order = SortOrder.ASC

        specs.append(
            EmployeeSortSpec(
                field=EmployeeSortField(field_raw.strip()),
                order=order,
            )
        )

    return specs


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
    sort: list[EmployeeSortSpec] | None = None
    sort_queries: list[str] = Field(default_factory=list, exclude=True)
    sort_by: EmployeeSortField = EmployeeSortField.FULL_NAME
    sort_order: SortOrder = SortOrder.ASC

    @model_validator(mode="after")
    def validate_sorts(self) -> "EmployeeListParams":
        if self.sort_queries:
            self.sort = parse_sort_query_values(self.sort_queries)

        resolved = self.resolved_sorts
        if not resolved:
            raise ValueError("At least one sort field is required")

        if len(resolved) > MAX_SORT_FIELDS:
            raise ValueError(f"A maximum of {MAX_SORT_FIELDS} sort fields is allowed")

        fields = [spec.field for spec in resolved]
        if len(fields) != len(set(fields)):
            raise ValueError("Duplicate sort fields are not allowed")

        return self

    @property
    def resolved_sorts(self) -> list[EmployeeSortSpec]:
        if self.sort:
            return self.sort

        return [
            EmployeeSortSpec(field=self.sort_by, order=self.sort_order),
        ]
