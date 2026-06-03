# AI Usage Notes

This project was built with Cursor as the primary development environment. AI assistance was used intentionally for speed and consistency, with human review and automated tests used to verify correctness.

## Where AI Helped

### Planning and documentation

- Drafted the initial requirements, architecture, database design, and API design documents from the assessment brief.
- Generated Mermaid diagrams and trade-off summaries for reviewer readability.
- Kept scope tight by documenting deliberate exclusions (auth, Excel import, payroll).

### Backend implementation

- Scaffolded the FastAPI project structure (config, async sessions, health endpoint).
- Implemented layered employee CRUD and salary insights following repository/service patterns.
- Added Alembic migrations, deterministic seed script, transaction helpers, and global exception handlers.
- Expanded pytest coverage for APIs, services, repositories, insights, seed behavior, and rollback.

### Frontend implementation

- Scaffolded Vite + React + TypeScript with MUI, React Query, and React Router.
- Built employee management UI (table, filters, dialogs) and insights dashboard.
- Added loading skeletons, API validation mapping, error alerts, and success feedback.
- Added Vitest tests for schemas, error helpers, validation mapping, and form interactions.

### Engineering conventions

- Created `.cursor/rules/` to encode backend architecture, query patterns, frontend patterns, and testing expectations so later AI edits stayed consistent.

## How Correctness Was Verified

AI-generated code was not accepted without verification. The main checks were:

| Area | Verification |
|---|---|
| Backend behavior | 46 pytest tests covering CRUD, validation, insights SQL, seed determinism, and transaction rollback |
| Frontend behavior | 13 Vitest tests for Zod schemas, error helpers, validation mapping, and employee form flows |
| Database performance | Aggregate insight queries run in PostgreSQL; list APIs use pagination and indexed filters |
| Seed script | Ran locally with `--count 10000 --clear`; confirmed deterministic output and bulk insert timing |
| API contracts | Checked OpenAPI docs and integration tests against expected response envelopes |
| Manual review | Read diffs for scope creep, security issues (no secret commits), and alignment with requirements |

When AI suggestions conflicted with assessment scope or existing conventions, the simpler option that met requirements was chosen (for example: no auth layer, no Excel import, SQL aggregates instead of in-memory analytics).

## What Was Not Delegated Blindly

- **Scope decisions** — exclusions and success criteria were reviewed against the assessment brief.
- **Trade-offs** — architecture choices (async SQLAlchemy, layered services, React Query caching) were documented with reasoning.
- **Test meaning** — tests assert behavior (API responses, rollback, form validation) rather than implementation trivia.
- **Commits** — work was committed incrementally with focused messages after each major step.

## Prompting Approach

Effective prompts in this project tended to:

1. Reference the assessment goal and current step in the plan.
2. Ask for incremental delivery (docs first, then backend, then frontend, then tests).
3. Require commit-and-push after each major milestone.
4. Keep `.cursor/rules` and existing patterns as constraints for new code.

Less effective prompts were broad requests without step boundaries, which increased the risk of over-engineering.

## Reproducibility For Reviewers

Reviewers can evaluate AI-assisted work by:

1. Reading commit history for incremental delivery.
2. Running `pytest` and `npm test`.
3. Following [demo-script.md](./demo-script.md) to exercise the UI and APIs.
4. Comparing implementation to [requirements.md](./requirements.md) and [architecture.md](./architecture.md).

If AI was used to regenerate part of this codebase, repeat the same verification: run tests, seed data, and walk through the demo script rather than relying on generated output alone.
