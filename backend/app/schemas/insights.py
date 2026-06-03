from decimal import Decimal

from pydantic import BaseModel, Field


class CountryInsightItem(BaseModel):
    country: str
    min_salary: str
    max_salary: str
    avg_salary: str
    employee_count: int
    salary_range: str


class CountryInsightsResponse(BaseModel):
    items: list[CountryInsightItem]


class DepartmentInsightItem(BaseModel):
    department: str
    avg_salary: str
    employee_count: int


class DepartmentInsightsResponse(BaseModel):
    items: list[DepartmentInsightItem]


class JobTitleInsightItem(BaseModel):
    job_title: str
    avg_salary: str
    employee_count: int


class JobTitleInsightsResponse(BaseModel):
    items: list[JobTitleInsightItem]


class CountryJobTitleInsightResponse(BaseModel):
    country: str
    job_title: str
    avg_salary: str | None
    employee_count: int


class CountryJobTitleInsightParams(BaseModel):
    country: str = Field(min_length=1, max_length=100)
    job_title: str = Field(min_length=1, max_length=150)
