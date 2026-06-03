# Scripts

## Seed employees

From the `backend` directory:

```bash
source .venv/bin/activate
python scripts/seed_employees.py --count 10000 --batch-size 500 --clear
```

Options:

- `--count` — number of employees to insert (default: 10000)
- `--batch-size` — bulk insert batch size (default: 500)
- `--clear` / `--no-clear` — truncate employees before seeding (default: clear)
- `--database-url` — override database URL
