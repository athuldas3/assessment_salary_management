from fastapi import APIRouter, Depends, Query

from app.api.deps import get_insights_service
from app.schemas.insights import (
    CountryInsightsResponse,
    CountryJobTitleInsightParams,
    CountryJobTitleInsightResponse,
    DepartmentInsightsResponse,
    JobTitleInsightsResponse,
)
from app.services.insights_service import InsightsService

router = APIRouter(prefix="/insights", tags=["insights"])


def get_country_job_title_params(
    country: str = Query(..., min_length=1, max_length=100),
    job_title: str = Query(..., min_length=1, max_length=150),
) -> CountryJobTitleInsightParams:
    return CountryJobTitleInsightParams(country=country, job_title=job_title)


@router.get("/by-country", response_model=CountryInsightsResponse)
async def get_insights_by_country(
    service: InsightsService = Depends(get_insights_service),
) -> CountryInsightsResponse:
    return await service.get_country_insights()


@router.get("/by-department", response_model=DepartmentInsightsResponse)
async def get_insights_by_department(
    service: InsightsService = Depends(get_insights_service),
) -> DepartmentInsightsResponse:
    return await service.get_department_insights()


@router.get("/by-job-title", response_model=JobTitleInsightsResponse)
async def get_insights_by_job_title(
    service: InsightsService = Depends(get_insights_service),
) -> JobTitleInsightsResponse:
    return await service.get_job_title_insights()


@router.get("/country-job-title", response_model=CountryJobTitleInsightResponse)
async def get_country_job_title_insight(
    params: CountryJobTitleInsightParams = Depends(get_country_job_title_params),
    service: InsightsService = Depends(get_insights_service),
) -> CountryJobTitleInsightResponse:
    return await service.get_country_job_title_insight(params)
