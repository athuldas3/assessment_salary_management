from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from sqlalchemy.ext.asyncio import AsyncSession


@asynccontextmanager
async def transaction(session: AsyncSession) -> AsyncGenerator[None, None]:
    try:
        yield
        await session.commit()
    except Exception:
        await session.rollback()
        raise
