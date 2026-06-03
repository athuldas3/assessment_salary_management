# Scripts

Backend utility scripts and common commands. For the full guide, see [docs/scripts.md](../../docs/scripts.md).

## Prerequisites

```bash
cd backend
source env/bin/activate
alembic upgrade head
```

## Seed employees

```bash
python scripts/seed_employees.py --count 10000 --batch-size 500 --clear
```

| Option | Default | Description |
|---|---|---|
| `--count` | `10000` | Number of employees to insert |
| `--batch-size` | `500` | Bulk insert batch size |
| `--clear` / `--no-clear` | clear | Truncate employees before seeding |
| `--database-url` | from env | Override target database |

## Generate sample Excel

```bash
pip install openpyxl
python scripts/generate_sample_excel.py
```

Writes `data/sample_employees.xlsx` (50 rows, reference only).

## Run API

```bash
python run.py
```

See [docs/scripts.md](../../docs/scripts.md) for migrations, tests, and troubleshooting.
