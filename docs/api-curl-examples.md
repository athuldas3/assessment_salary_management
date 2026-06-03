# API cURL Examples

Manual testing guide for all backend endpoints. Run the API first:

```bash
cd backend
source env/bin/activate
python run.py
```

Default base URL:

```bash
export BASE_URL="http://localhost:8000/api/v1"
```

Optional: seed data before testing list/insights endpoints:

```bash
python scripts/seed_employees.py --count 10000 --batch-size 500 --clear
```

---

## Health

### GET /health

Check that the API is running.

```bash
curl -sS "$BASE_URL/health" | jq
```

**Expected (200):**

```json
{
  "status": "ok"
}
```

---

## Employees

### GET /employees/metadata/filters

Distinct values for filter dropdowns.

```bash
curl -sS "$BASE_URL/employees/metadata/filters" | jq
```

**Expected (200):** `countries`, `job_titles`, and `departments` arrays.

---

### GET /employees

Paginated employee list with optional filters and sorting.

**Basic list:**

```bash
curl -sS "$BASE_URL/employees" | jq
```

**Pagination:**

```bash
curl -sS "$BASE_URL/employees?page=2&page_size=10" | jq
```

**Search by name (case-insensitive partial match):**

```bash
curl -sS "$BASE_URL/employees?search=Alice" | jq
```

**Filter by country:**

```bash
curl -sS "$BASE_URL/employees?country=United%20States" | jq
```

**Filter by job title:**

```bash
curl -sS "$BASE_URL/employees?job_title=Software%20Engineer" | jq
```

**Filter by department:**

```bash
curl -sS "$BASE_URL/employees?department=Engineering" | jq
```

**Combined filters:**

```bash
curl -sS "$BASE_URL/employees?country=Canada&job_title=Finance%20Analyst&department=Finance&search=Alice&page=1&page_size=20" | jq
```

**Sort by salary descending (legacy single-field params):**

```bash
curl -sS "$BASE_URL/employees?sort_by=salary&sort_order=desc" | jq
```

**Multi-field sort (country ascending, then salary descending):**

```bash
curl -sS "$BASE_URL/employees?sort=country:asc&sort=salary:desc&page_size=20" | jq
```

**Sort fields:** `full_name`, `country`, `job_title`, `department`, `salary`, `created_at`, `updated_at`  
**Sort format:** `field:order` where order is `asc` or `desc` (order defaults to `asc` when omitted)  
**Page size:** 1–100 (default 20)

---

### GET /employees/{employee_id}

Get one employee by UUID.

Replace `{employee_id}` with a real ID from the list response:

```bash
EMPLOYEE_ID="<paste-uuid-here>"

curl -sS "$BASE_URL/employees/$EMPLOYEE_ID" | jq
```

**Example after creating an employee (see POST below):**

```bash
EMPLOYEE_ID=$(curl -sS -X POST "$BASE_URL/employees" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Demo Employee",
    "country": "United States",
    "job_title": "Software Engineer",
    "department": "Engineering",
    "salary": "95000.00"
  }' | jq -r '.id')

curl -sS "$BASE_URL/employees/$EMPLOYEE_ID" | jq
```

**Not found (404):**

```bash
curl -sS -w "\nHTTP %{http_code}\n" \
  "$BASE_URL/employees/00000000-0000-0000-0000-000000000000" | jq
```

---

### POST /employees

Create a new employee.

```bash
curl -sS -X POST "$BASE_URL/employees" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Jane Doe",
    "country": "United States",
    "job_title": "Software Engineer",
    "department": "Engineering",
    "salary": "95000.00"
  }' | jq
```

**Expected (201):** employee object with `id`, timestamps, and formatted `salary`.

**Validation error (422) — non-positive salary:**

```bash
curl -sS -X POST "$BASE_URL/employees" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Jane Doe",
    "country": "United States",
    "job_title": "Software Engineer",
    "department": "Engineering",
    "salary": "0"
  }' | jq
```

**Validation error (422) — missing required field:**

```bash
curl -sS -X POST "$BASE_URL/employees" \
  -H "Content-Type: application/json" \
  -d '{
    "country": "United States",
    "job_title": "Software Engineer",
    "department": "Engineering",
    "salary": "95000.00"
  }' | jq
```

---

### PUT /employees/{employee_id}

Replace an employee record (all fields required).

```bash
curl -sS -X PUT "$BASE_URL/employees/$EMPLOYEE_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Jane Doe",
    "country": "Canada",
    "job_title": "Finance Analyst",
    "department": "Finance",
    "salary": "88000.50"
  }' | jq
```

**Not found (404):**

```bash
curl -sS -X PUT "$BASE_URL/employees/00000000-0000-0000-0000-000000000000" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Jane Doe",
    "country": "Canada",
    "job_title": "Finance Analyst",
    "department": "Finance",
    "salary": "88000.50"
  }' | jq
```

---

### DELETE /employees/{employee_id}

Delete an employee.

```bash
curl -sS -X DELETE "$BASE_URL/employees/$EMPLOYEE_ID" -w "\nHTTP %{http_code}\n"
```

**Expected:** HTTP 204 with empty body.

**Not found (404):**

```bash
curl -sS -X DELETE "$BASE_URL/employees/00000000-0000-0000-0000-000000000000" \
  -w "\nHTTP %{http_code}\n" | jq
```

---

## Salary Insights

All insight endpoints use SQL aggregates over seeded employee data.

### GET /insights/by-country

Min, max, average, count, and salary range per country.

```bash
curl -sS "$BASE_URL/insights/by-country" | jq
```

**Expected (200):** array of countries with `min_salary`, `max_salary`, `avg_salary`, `employee_count`, `salary_range`.

---

### GET /insights/by-department

Average salary and employee count per department.

```bash
curl -sS "$BASE_URL/insights/by-department" | jq
```

---

### GET /insights/by-job-title

Average salary and employee count per job title.

```bash
curl -sS "$BASE_URL/insights/by-job-title" | jq
```

---

### GET /insights/country-job-title

Average salary for a specific job title within a country.

```bash
curl -sS "$BASE_URL/insights/country-job-title?country=United%20States&job_title=Software%20Engineer" | jq
```

**Another example:**

```bash
curl -sS "$BASE_URL/insights/country-job-title?country=Germany&job_title=HR%20Manager" | jq
```

**Validation error (422) — missing query params:**

```bash
curl -sS "$BASE_URL/insights/country-job-title?country=Canada" | jq
```

---

## Error Response Format

Most errors use this envelope:

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Employee not found"
  }
}
```

Validation errors include field details:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": [
      {
        "field": "salary",
        "message": "Input should be greater than 0"
      }
    ]
  }
}
```

| HTTP status | Code | Typical cause |
|---|---|---|
| 404 | `NOT_FOUND` | Employee UUID does not exist |
| 422 | `VALIDATION_ERROR` | Invalid body or query parameters |
| 409 | `CONFLICT` | Database integrity constraint violation |
| 500 | `INTERNAL_ERROR` | Unexpected server/database failure |

---

## Full CRUD Smoke Test

Run end to end in one shell session:

```bash
export BASE_URL="http://localhost:8000/api/v1"

# Create
CREATE_RESPONSE=$(curl -sS -X POST "$BASE_URL/employees" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "API Test User",
    "country": "Australia",
    "job_title": "Data Analyst",
    "department": "Operations",
    "salary": "72000.00"
  }')
echo "$CREATE_RESPONSE" | jq

EMPLOYEE_ID=$(echo "$CREATE_RESPONSE" | jq -r '.id')

# Read
curl -sS "$BASE_URL/employees/$EMPLOYEE_ID" | jq

# Update
curl -sS -X PUT "$BASE_URL/employees/$EMPLOYEE_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "API Test User",
    "country": "Australia",
    "job_title": "Data Analyst",
    "department": "Operations",
    "salary": "75000.00"
  }' | jq

# List with filter
curl -sS "$BASE_URL/employees?search=API%20Test%20User" | jq

# Insights spot check
curl -sS "$BASE_URL/insights/by-country" | jq '.items[0]'

# Delete
curl -sS -X DELETE "$BASE_URL/employees/$EMPLOYEE_ID" -w "\nHTTP %{http_code}\n"
```

---

## OpenAPI Alternative

Interactive testing is also available at:

```text
http://localhost:8000/docs
```

Related docs: [api-design.md](./api-design.md), [demo-script.md](./demo-script.md)
