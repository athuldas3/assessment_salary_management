import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import CheckConstraint, DateTime, Index, Numeric, String, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Employee(Base):
    """Employee salary record.

    Indexes (e.g. on country) let the database use a B-Tree-style structure to find
    matching rows without scanning the entire table — e.g. country=India -> row ids
    3, 5, 100 instead of reading all 10,000 rows.
    """

    __tablename__ = "employees"
    __table_args__ = (
        CheckConstraint("salary > 0", name="ck_employees_salary_positive"),
        Index("ix_employees_country", "country"),
        Index("ix_employees_job_title", "job_title"),
        Index("ix_employees_country_job_title", "country", "job_title"),
        Index("ix_employees_department", "department"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        primary_key=True,
        default=uuid.uuid4,
    )
    full_name: Mapped[str] = mapped_column(String(200), nullable=False)
    country: Mapped[str] = mapped_column(String(100), nullable=False)
    job_title: Mapped[str] = mapped_column(String(150), nullable=False)
    department: Mapped[str] = mapped_column(String(150), nullable=False)
    salary: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        server_onupdate=func.now(),
        nullable=False,
    )
