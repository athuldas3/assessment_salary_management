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

Coverage includes Zod schemas, API error helpers, validation mapping, and employee form interactions.

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
2. Seed data if needed: `python scripts/seed_employees.py --count 10000 --batch-size 500 --clear`
3. Start frontend: `npm run dev`
4. Open `/employees` to manage employee records
5. Open `/insights` to review salary analytics

## UX

- Loading skeletons and refresh indicators on list and insights pages
- API validation errors mapped to form fields
- Success snackbars after create, update, and delete
