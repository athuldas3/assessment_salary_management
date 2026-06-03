# Docker Setup

Run the full ACME Salary Management stack (PostgreSQL, FastAPI backend, React frontend) with Docker Compose.

## Architecture

```text
Browser → http://localhost:8080
            ├── /              → React static files (nginx)
            └── /api/v1/*      → FastAPI backend (proxied to backend:8000)
                                      └── PostgreSQL (salary_management)
```

Direct backend access (optional): `http://localhost:8000/docs`

## Prerequisites

- Docker Engine 24+
- Docker Compose v2 (`docker compose`)

## Quick Start

From the repository root:

```bash
docker compose up --build
```

First startup may take a few minutes while images build, migrations run, and 10,000 employees are seeded.

### URLs

| Service | URL |
|---|---|
| Employee UI | http://localhost:8080/employees |
| Insights UI | http://localhost:8080/insights |
| Health (via proxy) | http://localhost:8080/api/v1/health |
| OpenAPI docs (direct) | http://localhost:8000/docs |

### Stop

```bash
docker compose down
```

Remove database volume and start fresh (re-seed on next up):

```bash
docker compose down -v
```

## Services

| Service | Image / build | Port | Purpose |
|---|---|---|---|
| `db` | `postgres:16-alpine` | internal | Application database |
| `backend` | `./backend/Dockerfile` | 8000 | FastAPI API |
| `frontend` | `./frontend/Dockerfile` | 8080 | nginx + React build |

## Startup Behavior

The backend entrypoint ([backend/docker-entrypoint.sh](../backend/docker-entrypoint.sh)) automatically:

1. Waits for PostgreSQL to be ready
2. Runs `alembic upgrade head`
3. Seeds employees when `SEED_ON_START=true` (default)
4. Starts Uvicorn on port 8000

The frontend container serves the production React build and proxies `/api` to the backend — same pattern as production nginx deployment.

## Environment Variables

Set these in [docker-compose.yml](../docker-compose.yml) or override with a `.env` file beside compose:

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql+asyncpg://postgres:postgres@db:5432/salary_management` | Backend database |
| `CORS_ORIGINS` | `http://localhost:8080` | Allowed browser origin |
| `SEED_ON_START` | `true` | Run seed script on container start |
| `SEED_COUNT` | `10000` | Employees to insert when seeding |
| `SEED_BATCH_SIZE` | `500` | Bulk insert batch size |
| `VITE_API_BASE_URL` | `/api/v1` | Frontend build-time API base (same-origin) |

### Keep data between restarts

Set `SEED_ON_START=false` after the first successful startup so restarts do not wipe and re-seed the database.

## Local Development vs Docker

| Topic | Local dev | Docker |
|---|---|---|
| App database | `salary_management` on localhost | `salary_management` in `db` container |
| Test database | `test_db` for `pytest` | Not used — run tests locally |
| Frontend | Vite dev server `:5173` | nginx static build `:8080` |
| API proxy | Vite → `:8000` | nginx → `backend:8000` |

Docker uses **one** application database, like production. The separate `test_db` is only for local pytest runs.

## Troubleshooting

| Problem | Likely cause | Fix |
|---|---|---|
| `permission denied` on `/var/run/docker.sock` | Shell session started before you joined the `docker` group | Log out and back in, or run `newgrp docker`, then retry. If not in the group: `sudo usermod -aG docker $USER` then log out/in |
| Build hangs on `apt-get update` / `Ign: deb.debian.org` | DNS failure inside Docker build containers | See **Fix Docker DNS** below |
| `pip` / `npm` fails with `Temporary failure in name resolution` | Same DNS issue during image build | Compose uses `network: host` for builds; also apply **Fix Docker DNS** for a permanent fix |
| Port 8080 or 8000 in use | Another local service | Stop conflicting service or change compose ports |
| Empty employee table | Seed disabled or failed startup | Check `docker compose logs backend`; set `SEED_ON_START=true` |
| CORS errors | Wrong origin | Ensure `CORS_ORIGINS=http://localhost:8080` |
| Frontend 404 on refresh | nginx misconfig | Rebuild frontend image; SPA fallback is in `frontend/nginx.conf` |
| Backend crash on start | DB not ready / migration error | `docker compose logs db backend` |
| Stale data | Old volume | `docker compose down -v && docker compose up --build` |

### Fix Docker DNS (recommended on Linux)

If builds fail with `Ign: deb.debian.org` or `Temporary failure in name resolution`, Docker’s internal DNS is broken even though your host network works. Apply this once:

```bash
sudo mkdir -p /etc/docker
echo '{"dns":["8.8.8.8","1.1.1.1"]}' | sudo tee /etc/docker/daemon.json
sudo systemctl restart docker
```

Verify:

```bash
docker run --rm alpine ping -c 2 deb.debian.org
```

This project also sets `network: host` on backend/frontend **builds** in `docker-compose.yml` so `pip` and `npm` use your host DNS during image build.

## Useful Commands

```bash
# Rebuild after code changes
docker compose up --build

# Run in background
docker compose up --build -d

# View logs
docker compose logs -f backend
docker compose logs -f frontend

# Smoke test
curl http://localhost:8080/api/v1/health
curl "http://localhost:8080/api/v1/employees?page_size=1"
```

## Related Docs

- [Root README](../README.md) — local setup without Docker
- [Deployment guidance](./deployment.md) — production hosting options
- [Scripts and commands](./scripts.md) — manual migrate/seed/test commands
- [Demo script](./demo-script.md) — walkthrough after the stack is running
