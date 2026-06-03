# Deployment Guidance

This document describes how to deploy the ACME Salary Management application beyond local development. The assessment does not require a live production deployment, but reviewers should be able to see a clear, practical path from local setup to a hosted environment.

## Deployment Model

The app is a standard three-tier layout:

```mermaid
flowchart LR
    browser[Browser]
    static[StaticFrontend]
    api[FastAPIBackend]
    db[(PostgreSQL)]

    browser --> static
    browser -->|"REST JSON"| api
    api --> db
```

| Component | Build output | Runtime |
|---|---|---|
| Frontend | `frontend/dist/` static assets | CDN, object storage, or reverse proxy |
| Backend | Python package in `backend/` | Uvicorn (or Gunicorn + Uvicorn workers) |
| Database | Alembic migrations | Managed or self-hosted PostgreSQL |

Recommended split for simplicity:

- **Frontend** — static hosting (Netlify, Vercel, S3 + CloudFront, nginx)
- **Backend** — container or PaaS service (Render, Railway, Fly.io, ECS)
- **Database** — managed PostgreSQL (RDS, Neon, Supabase, Render Postgres)

## Pre-Deploy Checklist

- [ ] PostgreSQL database created and reachable from the backend
- [ ] `DATABASE_URL` set to production connection string (`postgresql+asyncpg://...`)
- [ ] Alembic migrations applied: `alembic upgrade head`
- [ ] Initial data seeded once (if needed): `python scripts/seed_employees.py --count 10000 --batch-size 500 --clear`
- [ ] `DEBUG=false` in production
- [ ] `CORS_ORIGINS` includes the deployed frontend URL only
- [ ] Frontend built with the correct `VITE_API_BASE_URL`
- [ ] Health endpoint responds: `GET /api/v1/health`
- [ ] Backend and frontend tests pass in CI or locally before release

## Environment Variables

### Backend

| Variable | Example | Notes |
|---|---|---|
| `DATABASE_URL` | `postgresql+asyncpg://user:pass@host:5432/salary_management` | Required |
| `CORS_ORIGINS` | `https://salary.example.com` | Comma-separated if multiple origins |
| `DEBUG` | `false` | Never `true` in production |
| `LOG_LEVEL` | `INFO` | Use `WARNING` if log volume is a concern |
| `API_V1_PREFIX` | `/api/v1` | Keep default unless proxy strips prefix |

Set these via platform secrets, not committed files. Local defaults live in `backend/local.env`; production overrides belong in the host environment or a gitignored `.env`.

### Frontend

| Variable | Example | Notes |
|---|---|---|
| `VITE_API_BASE_URL` | `https://api.example.com/api/v1` | Baked in at **build** time |

For same-origin deployment behind one domain (see nginx example below), use:

```bash
VITE_API_BASE_URL=/api/v1
```

## Build Commands

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
```

Run the API:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

For higher concurrency on a VM, Uvicorn workers are usually enough:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 2
```

Optional hardening: disable public OpenAPI in production by setting `DEBUG=false` and restricting `/docs` at the reverse proxy.

### Frontend

```bash
cd frontend
npm ci
VITE_API_BASE_URL=https://api.example.com/api/v1 npm run build
```

Serve `frontend/dist/` from static hosting or nginx.

## Option A — Single VM With nginx

Good for demos, internal HR tools, or a single assessment staging server.

```text
https://salary.example.com/          → frontend static files
https://salary.example.com/api/v1/*  → proxy to backend :8000
```

Example nginx location blocks:

```nginx
server {
    listen 443 ssl;
    server_name salary.example.com;

    root /var/www/salary-management/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Backend environment on the same host:

```bash
export DATABASE_URL=postgresql+asyncpg://app:secret@db-host:5432/salary_management
export CORS_ORIGINS=https://salary.example.com
export DEBUG=false
```

Build frontend with same-origin API:

```bash
VITE_API_BASE_URL=/api/v1 npm run build
```

Run backend under systemd or a process manager so it restarts on failure.

## Option B — Split Frontend and Backend Hosting

Good for managed platforms with minimal ops.

### Backend (example: Render / Railway / Fly.io)

1. Deploy `backend/` as a web service.
2. Attach managed PostgreSQL and set `DATABASE_URL`.
3. Set startup command:

   ```bash
   alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```

4. Set `CORS_ORIGINS` to the frontend URL.
5. Run seed once via one-off job or SSH/console:

   ```bash
   python scripts/seed_employees.py --count 10000 --batch-size 500 --clear
   ```

### Frontend (example: Netlify / Vercel / CloudFront)

1. Build command: `npm ci && npm run build`
2. Publish directory: `dist`
3. Build env: `VITE_API_BASE_URL=https://your-api-host/api/v1`
4. Configure SPA fallback so `/employees` and `/insights` route to `index.html`

## Option C — Docker Compose

The repository includes a full local stack: PostgreSQL, FastAPI backend, and nginx-served React frontend.

```bash
docker compose up --build
```

- App UI: http://localhost:8080
- API health: http://localhost:8080/api/v1/health
- OpenAPI (direct): http://localhost:8000/docs

Migrations and seeding run automatically on backend startup. See [docker.md](./docker.md) for environment variables, persistence, and troubleshooting.

## Database Operations

### Migrations

Run on every backend deploy before traffic is routed:

```bash
alembic upgrade head
```

Rollback only with care in production:

```bash
alembic downgrade -1
```

### Seeding

- **Development / demo:** seed freely with `--clear`.
- **Production:** seed once during initial setup, not on every deploy.
- Re-seeding deletes existing employee data when `--clear` is used.

## Health Checks and Monitoring

| Check | Endpoint | Expected |
|---|---|---|
| API liveness | `GET /api/v1/health` | HTTP 200, healthy status payload |
| Database | implied by app queries | failed queries surface as 500 with safe message |

Platform health checks should hit `/api/v1/health`, not `/docs`.

Monitor:

- API error rate and latency
- PostgreSQL connections and slow queries on insight aggregates
- Disk usage for PostgreSQL backups

## Security Notes (Production)

Auth is out of scope for v1, so treat deployments as **internal/trusted network only** unless you add authentication later.

Minimum baseline:

- HTTPS everywhere (TLS termination at load balancer or nginx)
- Restrict `CORS_ORIGINS` to known frontend domains
- Keep `DEBUG=false`
- Do not commit secrets; use platform secret stores
- Restrict database access to the backend service only
- Consider blocking public access to `/docs` and OpenAPI JSON

## CI/CD Suggested Pipeline

```text
1. Install dependencies
2. Run backend pytest (against test_db)
3. Run frontend npm test
4. Build frontend
5. Run alembic upgrade head on staging/production
6. Deploy backend
7. Deploy frontend static assets
8. Smoke test /api/v1/health and one insights endpoint
```

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| CORS errors in browser | `CORS_ORIGINS` mismatch | Set exact frontend origin including scheme |
| Frontend 404 on refresh | SPA routing | Configure fallback to `index.html` |
| Empty insights | Database not seeded | Run seed script once |
| API 500 on startup | Migration not applied | `alembic upgrade head` |
| Wrong API host in frontend | Build-time env | Rebuild with correct `VITE_API_BASE_URL` |

## Related Docs

- [Root README](../README.md) — local setup
- [Architecture](./architecture.md) — system design and trade-offs
- [Demo script](./demo-script.md) — post-deploy verification walkthrough
- [Docker setup](./docker.md) — run full stack with Docker Compose
