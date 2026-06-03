"""create employees table

Revision ID: 8f2c1a9b4d10
Revises:
Create Date: 2026-06-03 22:30:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "8f2c1a9b4d10"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "employees",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("full_name", sa.String(length=200), nullable=False),
        sa.Column("country", sa.String(length=100), nullable=False),
        sa.Column("job_title", sa.String(length=150), nullable=False),
        sa.Column("department", sa.String(length=150), nullable=False),
        sa.Column("salary", sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.CheckConstraint("salary > 0", name="ck_employees_salary_positive"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_employees_country", "employees", ["country"], unique=False)
    op.create_index("ix_employees_job_title", "employees", ["job_title"], unique=False)
    op.create_index(
        "ix_employees_country_job_title",
        "employees",
        ["country", "job_title"],
        unique=False,
    )
    op.create_index("ix_employees_department", "employees", ["department"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_employees_department", table_name="employees")
    op.drop_index("ix_employees_country_job_title", table_name="employees")
    op.drop_index("ix_employees_job_title", table_name="employees")
    op.drop_index("ix_employees_country", table_name="employees")
    op.drop_table("employees")
