# Backend

FastAPI backend for the ACME salary management assessment.

## Setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

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
