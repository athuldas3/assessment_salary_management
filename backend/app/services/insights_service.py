from app.repositories.insights_repository import InsightsRepository
from app.schemas.insights import (
    CountryInsightsResponse,
    CountryJobTitleInsightParams,
    CountryJobTitleInsightResponse,
    DepartmentInsightsResponse,
    JobTitleInsightsResponse,
)


class InsightsService:
    def __init__(self, repository: InsightsRepository) -> None:
        self.repository = repository

    async def get_country_insights(self) -> CountryInsightsResponse:
        items = await self.repository.get_country_insights()
        return CountryInsightsResponse(items=items)

    async def get_department_insights(self) -> DepartmentInsightsResponse:
        items = await self.repository.get_department_insights()
        return DepartmentInsightsResponse(items=items)

    async def get_job_title_insights(self) -> JobTitleInsightsResponse:
        items = await self.repository.get_job_title_insights()
        return JobTitleInsightsResponse(items=items)

    async def get_country_job_title_insight(
        self,
        params: CountryJobTitleInsightParams,
    ) -> CountryJobTitleInsightResponse:
        result = await self.repository.get_country_job_title_insight(
            country=params.country,
            job_title=params.job_title,
        )
        return CountryJobTitleInsightResponse(**result)
