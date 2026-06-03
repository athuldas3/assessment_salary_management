#!/bin/sh
set -e

echo "Waiting for PostgreSQL..."
until python - <<'PY'
import asyncio
import os
import sys

import asyncpg

async def check() -> None:
    url = os.environ["DATABASE_URL"].replace("+asyncpg", "")
    conn = await asyncpg.connect(url)
    await conn.close()

asyncio.run(check())
PY
do
  echo "Database not ready yet. Retrying in 2s..."
  sleep 2
done

echo "Running migrations..."
alembic upgrade head

if [ "${SEED_ON_START:-true}" = "true" ]; then
  echo "Seeding employee data..."
  python scripts/seed_employees.py \
    --count "${SEED_COUNT:-10000}" \
    --batch-size "${SEED_BATCH_SIZE:-500}" \
    --clear
fi

echo "Starting API server..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
