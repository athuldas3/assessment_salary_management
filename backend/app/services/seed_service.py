from sqlalchemy import delete, func, insert, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ValidationError
from app.core.transactions import transaction
from app.models.employee import Employee
from app.services.seed_data import generate_employee_records


class SeedService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def count_employees(self) -> int:
        result = await self.session.execute(select(func.count()).select_from(Employee))
        return result.scalar_one()

    async def clear_employees(self) -> None:
        await self.session.execute(delete(Employee))

    async def seed_employees(
        self,
        count: int = 10_000,
        batch_size: int = 500,
        clear_existing: bool = True,
    ) -> int:
        if count <= 0:
            raise ValidationError("Seed count must be greater than 0")
        if batch_size <= 0:
            raise ValidationError("Batch size must be greater than 0")

        async with transaction(self.session):
            if clear_existing:
                await self.clear_employees()

            for start in range(0, count, batch_size):
                end = min(start + batch_size, count)
                records = generate_employee_records(start, end)
                await self.session.execute(insert(Employee), records)

            total = await self.count_employees()
            if total != count:
                raise ValidationError(
                    f"Seed completed with unexpected employee count: {total}, expected {count}"
                )

        return total
