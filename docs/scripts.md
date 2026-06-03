# Scripts And Commands

How to run backend scripts, migrations, the API server, and tests. All backend commands assume you are in the `backend/` directory with a virtual environment active.

## Prerequisites

```bash
cd backend
source env/bin/activate          # or: source .venv/bin/activate
pip install -r requirements.txt
cp local.env .env                # optional overrides
```

PostgreSQL must be running. Create databases once:

```sql
CREATE DATABASE salary_management;
CREATE DATABASE test_db;
```

Apply migrations before seeding or running the API:

```bash
alembic upgrade head
```

---

## Quick Reference

| Task | Command |
|---|---|
| Run API | `python run.py` |
| Seed 10,000 employees | `python scripts/seed_employees.py --count 10000 --batch-size 500 --clear` |
| Regenerate sample Excel | `pip install openpyxl && python scripts/generate_sample_excel.py` |
| Apply migrations | `alembic upgrade head` |
| Rollback one migration | `alembic downgrade -1` |
| Backend tests | `pytest` |
| Frontend tests | `cd ../frontend && npm test` |
| Run full stack in Docker | `docker compose up --build` (see [docker.md](../docs/docker.md)) |

**Typical first-time flow:**

```bash
cd backend
source env/bin/activate
alembic upgrade head
python scripts/seed_employees.py --count 10000 --batch-size 500 --clear
python run.py
```

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

### Docker alternative

From the repository root, run migrations, seed, backend, and frontend together:

```bash
docker compose up --build
```

Open http://localhost:8080 — no local Python/Node setup required. Details: [docs/docker.md](../docs/docker.md).

---

## Run The API

### Option A — `run.py` (recommended)

From `backend/`:

```bash
python run.py
```

Starts Uvicorn with reload on `http://0.0.0.0:8000`.

### Option B — Uvicorn directly

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Verify

- Health: `http://localhost:8000/api/v1/health`
- OpenAPI: `http://localhost:8000/docs`

### Common mistake

Do **not** run `python app/main.py`. That fails with `ModuleNotFoundError: No module named 'app'` because Python must be started from the `backend/` root, not from inside `app/`.

---

## Seed Employees

**Script:** `backend/scripts/seed_employees.py`

Inserts deterministic employee salary data into PostgreSQL using bulk batches and a transaction. Used for local development, demos, and performance testing with 10,000 rows.

### Basic usage

```bash
python scripts/seed_employees.py --count 10000 --batch-size 500 --clear
```

### Options

| Flag | Default | Description |
|---|---|---|
| `--count` | `10000` | Number of employees to insert |
| `--batch-size` | `500` | Rows per bulk insert batch |
| `--clear` | enabled | Delete all existing employees before seeding |
| `--no-clear` | — | Append without truncating (may cause duplicates if run repeatedly) |
| `--database-url` | from `.env` / `local.env` | Override the target database URL |

### Examples

**Full assessment dataset (recommended):**

```bash
python scripts/seed_employees.py --count 10000 --batch-size 500 --clear
```

**Small dataset for quick testing:**

```bash
python scripts/seed_employees.py --count 100 --batch-size 50 --clear
```

**Append without clearing:**

```bash
python scripts/seed_employees.py --count 50 --no-clear
```

**Seed a specific database:**

```bash
python scripts/seed_employees.py --count 1000 --clear \
  --database-url "postgresql+asyncpg://postgres:postgres@localhost:5432/salary_management"
```

### Notes

- Seeded countries include United States, United Kingdom, Germany, India, Canada, and Australia.
- Job titles include Software Engineer, Product Manager, HR Manager, Data Analyst, Sales Executive, and Finance Analyst.
- `--clear` removes all rows from the `employees` table before insert. Use with care outside local development.
- The script logs total rows inserted and elapsed time on completion.

---

## Generate Sample Excel

**Script:** `backend/scripts/generate_sample_excel.py`

Creates `data/sample_employees.xlsx` with 50 sample rows for assessment reference. The web app does **not** import this file; it is documentation/demo context only.

### Usage

```bash
pip install openpyxl
python scripts/generate_sample_excel.py
```

**Output:** `data/sample_employees.xlsx`

See also [data/README.md](../data/README.md).

---

## Database Migrations (Alembic)

Migrations live in `backend/alembic/versions/`. Run from `backend/`:

```bash
# Apply all pending migrations
alembic upgrade head

# Show current revision
alembic current

# Show migration history
alembic history

# Roll back the latest migration
alembic downgrade -1
```

### Test database

Tests use `test_db`. Apply migrations before running pytest:

```bash
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/test_db alembic upgrade head
pytest
```

---

## Tests

### Backend

From `backend/` with venv active:

```bash
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/test_db alembic upgrade head
pytest
```

Optional:

```bash
pytest -v                    # verbose
pytest tests/test_seed.py    # single file
```

### Frontend

```bash
cd frontend
npm install
npm test
```

---

## Environment Variables

Scripts and the API read configuration from `local.env` and `.env` (`.env` overrides `local.env`).

| Variable | Used by | Purpose |
|---|---|---|
| `DATABASE_URL` | API, seed script | Main app database |
| `TEST_DATABASE_URL` | Tests | Separate test database |
| `CORS_ORIGINS` | API | Allowed frontend origins |
| `DEBUG` | API | Debug mode (keep `false` in production) |
| `LOG_LEVEL` | API, scripts | Logging verbosity |

The seed script accepts `--database-url` to override `DATABASE_URL` for one-off runs.

---

## Troubleshooting

| Problem | Likely cause | Fix |
|---|---|---|
| `ModuleNotFoundError: No module named 'app'` | Wrong working directory or running `app/main.py` | `cd backend` and use `python run.py` |
| Connection refused to PostgreSQL | DB not running | Start PostgreSQL; check host/port |
| Database does not exist | DB not created | `CREATE DATABASE salary_management;` |
| Empty API responses | Not seeded | Run seed script with `--clear` |
| Migration errors | Schema out of date | `alembic upgrade head` |
| `openpyxl` not found | Optional dep not installed | `pip install openpyxl` before Excel script |

---

## Related Docs

- [Root README](../README.md) — project overview
- [Backend README](../backend/README.md) — backend setup details
- [API cURL examples](./api-curl-examples.md) — manual API testing after the server is running
- [Demo script](./demo-script.md) — full reviewer walkthrough
