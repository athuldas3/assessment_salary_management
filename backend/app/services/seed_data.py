import uuid
from dataclasses import dataclass
from decimal import Decimal

COUNTRIES: list[tuple[str, int, int]] = [
    ("United States", 70000, 180000),
    ("United Kingdom", 45000, 120000),
    ("Germany", 50000, 130000),
    ("India", 800000, 2500000),
    ("Canada", 65000, 150000),
    ("Australia", 70000, 160000),
]

JOB_TITLES: list[str] = [
    "Software Engineer",
    "Product Manager",
    "HR Manager",
    "Data Analyst",
    "Sales Executive",
    "Finance Analyst",
]

JOB_DEPARTMENTS: dict[str, str] = {
    "Software Engineer": "Engineering",
    "Product Manager": "Product",
    "HR Manager": "HR",
    "Data Analyst": "Operations",
    "Sales Executive": "Sales",
    "Finance Analyst": "Finance",
}

FIRST_NAMES = [
    "Alice",
    "Bob",
    "Carol",
    "David",
    "Elena",
    "Frank",
    "Grace",
    "Henry",
]

LAST_NAMES = [
    "Anderson",
    "Brown",
    "Clark",
    "Davis",
    "Evans",
    "Foster",
    "Garcia",
    "Harris",
]


@dataclass(frozen=True)
class EmployeeSeedRecord:
    id: uuid.UUID
    full_name: str
    country: str
    job_title: str
    department: str
    salary: Decimal


def build_employee_record(index: int) -> EmployeeSeedRecord:
    country_name, salary_min, salary_max = COUNTRIES[index % len(COUNTRIES)]
    job_title = JOB_TITLES[index % len(JOB_TITLES)]
    department = JOB_DEPARTMENTS[job_title]

    salary_offset = (index * 9973 + len(job_title) * 101) % (salary_max - salary_min + 1)
    salary = Decimal(salary_min + salary_offset).quantize(Decimal("0.01"))

    first_name = FIRST_NAMES[index % len(FIRST_NAMES)]
    last_name = LAST_NAMES[(index // len(FIRST_NAMES)) % len(LAST_NAMES)]
    full_name = f"{first_name} {last_name} {index:05d}"

    employee_id = uuid.uuid5(uuid.NAMESPACE_DNS, f"acme-employee-{index}")

    return EmployeeSeedRecord(
        id=employee_id,
        full_name=full_name,
        country=country_name,
        job_title=job_title,
        department=department,
        salary=salary,
    )


def generate_employee_records(start: int, end: int) -> list[dict]:
    return [
        {
            "id": record.id,
            "full_name": record.full_name,
            "country": record.country,
            "job_title": record.job_title,
            "department": record.department,
            "salary": record.salary,
        }
        for index in range(start, end)
        for record in [build_employee_record(index)]
    ]
