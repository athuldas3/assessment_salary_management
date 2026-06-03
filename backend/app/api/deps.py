from collections.abc import AsyncGenerator

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db_session
from app.repositories.employee_repository import EmployeeRepository
from app.repositories.insights_repository import InsightsRepository
from app.services.employee_service import EmployeeService
from app.services.insights_service import InsightsService


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async for session in get_db_session():
        yield session


def get_employee_repository(
    session: AsyncSession = Depends(get_db),
) -> EmployeeRepository:
    return EmployeeRepository(session)


def get_employee_service(
    repository: EmployeeRepository = Depends(get_employee_repository),
) -> EmployeeService:
    return EmployeeService(repository)


def get_insights_repository(
    session: AsyncSession = Depends(get_db),
) -> InsightsRepository:
    return InsightsRepository(session)


def get_insights_service(
    repository: InsightsRepository = Depends(get_insights_repository),
) -> InsightsService:
    return InsightsService(repository)
