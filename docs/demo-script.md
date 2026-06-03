# Demo Script

Use this walkthrough to evaluate the ACME Salary Management application end to end. Estimated time: **10–15 minutes**.

## Before You Start

1. PostgreSQL is running with `salary_management` and `test_db` databases.
2. Backend is running on port `8000`.
3. Frontend is running on port `5173`.
4. Database is seeded with 10,000 employees:

```bash
cd backend
source .venv/bin/activate
python scripts/seed_employees.py --count 10000 --batch-size 500 --clear
```

Optional context: open `data/sample_employees.xlsx` to see the spreadsheet-style data ACME previously used.

---

## Part 1 — Backend Health (1 min)

1. Open `http://localhost:8000/api/v1/health`
   - Expect: `{"status":"ok"}` (or equivalent healthy response)

2. Open `http://localhost:8000/docs`
   - Confirm employee CRUD and insights endpoints are listed under `/api/v1`

---

## Part 2 — Employee Management UI (5 min)

Open `http://localhost:5173/employees`.

### Browse and filter

1. Confirm the employee table loads with paginated rows.
2. Use **Search** to find an employee by name.
3. Filter by **Country** and **Job title**.
4. Change page size or navigate to the next page.
   - Expect: list stays responsive; no full-table load in the browser.

### Create

1. Click **Add Employee**.
2. Submit empty form.
   - Expect: inline validation errors (required fields, salary rules).
3. Create a valid employee, for example:
   - Full name: `Demo Employee`
   - Country: `United States`
   - Job title: `Software Engineer`
   - Department: `Engineering`
   - Annual salary: `95000`
   - Expect: success snackbar and new row in the table.

### Edit

1. Edit the employee you just created.
2. Change salary to `98000` and save.
   - Expect: updated value in the table and success feedback.

### Delete

1. Delete the demo employee.
   - Expect: confirmation dialog, then row removed and success feedback.

---

## Part 3 — Salary Insights (4 min)

Open `http://localhost:5173/insights`.

### Summary and tables

1. Confirm summary cards show countries covered and employee count (~10,000).
2. Review **Average salary by country** table:
   - Min, max, average, range, and employee count per country.
3. Review **Average salary by department** and **Average salary by job title** tables.

### Country + job title lookup

1. Select a country and job title from the dropdowns.
2. Click **Analyze**.
   - Expect: average salary and employee count for that combination.
3. Try a combination with no employees (if available).
   - Expect: friendly empty-state message, not a crash.

---

## Part 4 — API Spot Checks (2 min)

Use Swagger (`/docs`) or curl:

```bash
# Paginated list
curl "http://localhost:8000/api/v1/employees?page=1&page_size=5"

# Country insights
curl "http://localhost:8000/api/v1/insights/by-country"

# Country + job title insight
curl "http://localhost:8000/api/v1/insights/country-job-title?country=United%20States&job_title=Software%20Engineer"
```

Expect consistent JSON shapes and fast responses on seeded data.

---

## Part 5 — Automated Tests (2 min)

```bash
cd backend && pytest
cd ../frontend && npm test
```

Expect all tests to pass.

---

## What To Look For

| Criteria | Pass indicator |
|---|---|
| HR usability | CRUD works without database knowledge |
| Performance | Paginated list and SQL-backed insights stay responsive at 10k rows |
| Architecture | Clear separation: routes → services → repositories |
| Reliability | Validation errors are readable; failed writes do not leave partial data |
| Testing | Meaningful backend and frontend tests pass deterministically |
| Documentation | README and design docs match the running application |

---

## Troubleshooting

| Issue | Fix |
|---|---|
| Empty employee table | Run seed script with `--clear` |
| Frontend cannot reach API | Ensure backend is on `:8000`; Vite proxies `/api` to backend |
| Migration errors | `alembic upgrade head` in `backend/` against `salary_management` |
| Test DB failures | Create `test_db` and run migrations with `TEST_DATABASE_URL` |

For setup details, see the [root README](../README.md).
