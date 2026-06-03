import argparse
import asyncio
import logging
import sys
import time
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import settings
from app.core.logging import configure_logging
from app.services.seed_service import SeedService

logger = logging.getLogger(__name__)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Seed employee salary data")
    parser.add_argument("--count", type=int, default=10_000, help="Number of employees to seed")
    parser.add_argument(
        "--batch-size",
        type=int,
        default=500,
        help="Number of rows per bulk insert batch",
    )
    parser.add_argument(
        "--clear",
        action=argparse.BooleanOptionalAction,
        default=True,
        help="Clear existing employees before seeding",
    )
    parser.add_argument(
        "--database-url",
        type=str,
        default=settings.database_url,
        help="Database URL to seed",
    )
    return parser.parse_args()


async def run_seed(
    database_url: str,
    count: int,
    batch_size: int,
    clear_existing: bool,
) -> int:
    engine = create_async_engine(database_url, pool_pre_ping=True)
    session_factory = async_sessionmaker(
        bind=engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autoflush=False,
        autocommit=False,
    )

    try:
        async with session_factory() as session:
            service = SeedService(session)
            total = await service.seed_employees(
                count=count,
                batch_size=batch_size,
                clear_existing=clear_existing,
            )
            return total
    finally:
        await engine.dispose()


async def main() -> None:
    configure_logging()
    args = parse_args()

    logger.info(
        "Starting seed: count=%s batch_size=%s clear=%s",
        args.count,
        args.batch_size,
        args.clear,
    )
    started_at = time.perf_counter()

    total = await run_seed(
        database_url=args.database_url,
        count=args.count,
        batch_size=args.batch_size,
        clear_existing=args.clear,
    )

    elapsed = time.perf_counter() - started_at
    logger.info("Seed completed: %s employees in %.2f seconds", total, elapsed)


if __name__ == "__main__":
    asyncio.run(main())
