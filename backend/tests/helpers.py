from decimal import Decimal

from app.repositories.employee_repository import EmployeeRepository, EmployeeWriteData

SAMPLE_EMPLOYEES = [
    EmployeeWriteData(
        full_name="Alice US Engineer",
        country="United States",
        job_title="Software Engineer",
        department="Engineering",
        salary=Decimal("100000.00"),
    ),
    EmployeeWriteData(
        full_name="Bob US Engineer",
        country="United States",
        job_title="Software Engineer",
        department="Engineering",
        salary=Decimal("120000.00"),
    ),
    EmployeeWriteData(
        full_name="Carol Germany HR",
        country="Germany",
        job_title="HR Manager",
        department="HR",
        salary=Decimal("80000.00"),
    ),
    EmployeeWriteData(
        full_name="David UK Analyst",
        country="United Kingdom",
        job_title="Data Analyst",
        department="Operations",
        salary=Decimal("70000.00"),
    ),
]


async def seed_sample_employees(repository: EmployeeRepository) -> None:
    for employee in SAMPLE_EMPLOYEES:
        await repository.create(employee)
    await repository.session.commit()
