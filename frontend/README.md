# Frontend

React + TypeScript frontend for the ACME salary management assessment.

## Stack

- Vite
- React 19 + TypeScript
- Material UI
- TanStack Query
- React Hook Form + Zod
- React Router

## Setup

```bash
cd frontend
npm install
cp .env.example .env
```

## Run

```bash
npm run dev
```

Open `http://localhost:5173`.

The Vite dev server proxies `/api` requests to `http://localhost:8000`.

## Test

```bash
npm test
```

## Structure

```text
src/
  api/          API client, types, and React Query hooks
  components/   Shared UI components and layout
  pages/        Route-level screens
  schemas/      Zod validation schemas
```

## Verify

1. Start backend: `uvicorn app.main:app --reload`
2. Start frontend: `npm run dev`
3. Confirm the sidebar loads and the API status chip shows `API connected`
