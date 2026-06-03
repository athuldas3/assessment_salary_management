from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.employee import Employee


def _format_salary(value: Decimal | None) -> str | None:
    if value is None:
        return None
    return f"{value:.2f}"


class InsightsRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_country_insights(self) -> list[dict]:
        query = (
            select(
                Employee.country,
                func.min(Employee.salary).label("min_salary"),
                func.max(Employee.salary).label("max_salary"),
                func.round(func.avg(Employee.salary), 2).label("avg_salary"),
                func.count().label("employee_count"),
            )
            .group_by(Employee.country)
            .order_by(Employee.country)
        )
        result = await self.session.execute(query)

        items = []
        for row in result.all():
            min_salary = _format_salary(row.min_salary)
            max_salary = _format_salary(row.max_salary)
            items.append(
                {
                    "country": row.country,
                    "min_salary": min_salary,
                    "max_salary": max_salary,
                    "avg_salary": _format_salary(row.avg_salary),
                    "employee_count": row.employee_count,
                    "salary_range": f"{min_salary} - {max_salary}",
                }
            )
        return items

    async def get_department_insights(self) -> list[dict]:
        query = (
            select(
                Employee.department,
                func.round(func.avg(Employee.salary), 2).label("avg_salary"),
                func.count().label("employee_count"),
            )
            .group_by(Employee.department)
            .order_by(Employee.department)
        )
        result = await self.session.execute(query)

        return [
            {
                "department": row.department,
                "avg_salary": _format_salary(row.avg_salary),
                "employee_count": row.employee_count,
            }
            for row in result.all()
        ]

    async def get_job_title_insights(self) -> list[dict]:
        query = (
            select(
                Employee.job_title,
                func.round(func.avg(Employee.salary), 2).label("avg_salary"),
                func.count().label("employee_count"),
            )
            .group_by(Employee.job_title)
            .order_by(Employee.job_title)
        )
        result = await self.session.execute(query)

        return [
            {
                "job_title": row.job_title,
                "avg_salary": _format_salary(row.avg_salary),
                "employee_count": row.employee_count,
            }
            for row in result.all()
        ]

    async def get_country_job_title_insight(
        self,
        country: str,
        job_title: str,
    ) -> dict:
        query = select(
            func.round(func.avg(Employee.salary), 2).label("avg_salary"),
            func.count().label("employee_count"),
        ).where(
            Employee.country == country,
            Employee.job_title == job_title,
        )
        result = await self.session.execute(query)
        row = result.one()

        return {
            "country": country,
            "job_title": job_title,
            "avg_salary": _format_salary(row.avg_salary) if row.employee_count else None,
            "employee_count": row.employee_count,
        }
