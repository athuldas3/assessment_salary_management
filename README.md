# ACME Salary Management

End-to-end salary management web application for ACME's HR Manager. Manage 10,000 employee salary records and review compensation insights by country, department, and job title.

## Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI, SQLAlchemy 2.x (async), Alembic, Pydantic |
| Database | PostgreSQL |
| Frontend | React 19, TypeScript, Vite, Material UI, TanStack Query |
| Testing | Pytest (backend), Vitest + React Testing Library (frontend) |

## Prerequisites

- Python 3.11+
- Node.js 20+ and npm
- PostgreSQL 14+ (`postgres` / `postgres` @ `localhost:5432`)

Create databases once:

```sql
CREATE DATABASE salary_management;
CREATE DATABASE test_db;
```

## Quick Start

### 1. Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp local.env .env
alembic upgrade head
python scripts/seed_employees.py --count 10000 --batch-size 500 --clear
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Verify:

- Health: `GET http://localhost:8000/api/v1/health`
- OpenAPI: `http://localhost:8000/docs`

### 2. Frontend

In a second terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:5173`.

Routes:

- `/employees` — paginated employee management (search, filter, CRUD)
- `/insights` — salary analytics dashboard

## Tests

Backend (uses `test_db`):

```bash
cd backend
source .venv/bin/activate
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/test_db alembic upgrade head
pytest
```

Frontend:

```bash
cd frontend
npm test
```

Current coverage: **46 backend tests**, **13 frontend tests**.

## Repository Layout

```text
.
├── backend/          FastAPI app, migrations, seed script, tests
├── frontend/         React UI, API client, component tests
├── data/             Sample Excel reference file (50 rows)
├── docs/             Requirements, architecture, API/DB design, AI notes, demo script
└── .cursor/rules/    Project engineering conventions used during development
```

## Documentation

| Document | Purpose |
|---|---|
| [Requirements](docs/requirements.md) | Scope, exclusions, success criteria |
| [Architecture](docs/architecture.md) | Layered design, trade-offs, diagrams |
| [Database design](docs/database-design.md) | Schema, indexes, query patterns |
| [API design](docs/api-design.md) | REST endpoints and response shapes |
| [AI usage notes](docs/ai-usage-notes.md) | How AI assisted and how correctness was verified |
| [Demo script](docs/demo-script.md) | Step-by-step walkthrough for reviewers |
| [Deployment guidance](docs/deployment.md) | Production env vars, hosting options, and release checklist |
| [Final review checklist](docs/final-review-checklist.md) | Pre-submission verification against assessment criteria |

Component READMEs:

- [Backend setup](backend/README.md)
- [Frontend setup](frontend/README.md)
- [Sample data](data/README.md)

## Key Features

- Paginated employee list with search and filters (country, job title)
- Create, edit, and delete employee records with validation
- Salary insights computed in PostgreSQL (not in application memory)
- Deterministic seed of 10,000 employees (~0.35s bulk insert)
- Consistent API error envelope and transaction rollback on failures
- Loading, validation, and error states in the UI

## Out of Scope

Authentication, Excel import/export, payroll processing, and advanced BI dashboards are intentionally excluded. See [requirements](docs/requirements.md) for rationale.

## Sample Data

`data/sample_employees.xlsx` shows the spreadsheet-style data ACME previously used. The web app loads data via the backend seed script, not Excel import.

## License

Assessment submission project.
