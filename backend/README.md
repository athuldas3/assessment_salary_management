# Backend

FastAPI backend for the ACME salary management assessment.

## Setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp local.env .env
```

Environment files:

- `local.env` — committed local defaults for development
- `.env` — optional overrides (gitignored); takes precedence over `local.env`

Database settings:

| Purpose | Database | URL variable |
|---|---|---|
| App | `salary_management` | `DATABASE_URL` |
| Tests | `test_db` | `TEST_DATABASE_URL` |

PostgreSQL connection: `postgres` / `postgres` @ `localhost:5432`

## Run

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Verify

- Health check: `GET http://localhost:8000/api/v1/health`
- OpenAPI docs: `http://localhost:8000/docs`

## Test

```bash
pytest
```
