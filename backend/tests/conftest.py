import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.api.deps import get_db
from app.core.config import settings
from app.main import app
from app.repositories.employee_repository import EmployeeRepository


@pytest.fixture(scope="session")
def test_database_url() -> str:
    return settings.test_database_url


@pytest.fixture
async def db_session(test_database_url):
    engine = create_async_engine(test_database_url, pool_pre_ping=True)
    session_factory = async_sessionmaker(
        bind=engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autoflush=False,
        autocommit=False,
    )

    async with session_factory() as session:
        yield session

    await engine.dispose()


@pytest.fixture(autouse=True)
async def clean_employees(db_session):
    repository = EmployeeRepository(db_session)
    await repository.delete_all()
    await db_session.commit()
    yield
    await repository.delete_all()
    await db_session.commit()


@pytest.fixture
async def client(db_session):
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as async_client:
        yield async_client

    app.dependency_overrides.clear()
